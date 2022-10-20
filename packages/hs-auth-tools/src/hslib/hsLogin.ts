import axios from 'axios';
import { getHsSetting } from './hsSetting';
import { hsProductConfig, hsTestConfig, ticketKey } from '../constants';
import { getHsConfig, getHsUserInfo, getHsTicket } from './hsBase';
import { getPathStorage, getTokenStorage, getUserStorage } from '../storages';
import { HsUserInfo } from './types';

/** 根据票据获取用户信息 */
export async function getUserInfoByToken(token: string) {
  const { hsStatisticsUrl } = getHsSetting().isTestEnv ? hsTestConfig : hsProductConfig;
  const localToken = getTokenStorage().get();
  if (token === localToken) {
    return getHsUserInfo();
  }
  try {
    const res = await axios.post(`${hsStatisticsUrl}users/get_user_info/`, { cache_token: token });
    if (res.data['code'] === 200 && res.data['data']) {
      getTokenStorage().set(token);
      return res.data['data'] as HsUserInfo;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
/** 根据票据获取用户信息,票据从链接里获取 */
export async function getUserInfoByTicket() {
  const ticket = getHsTicket();
  if (ticket) {
    const token = await getUserInfoByToken(ticket);
    return token;
  } else {
    return null;
  }
}

/** 授权登录 */
export const toOAuth = () => {
  const pathInfo = JSON.stringify({
    search: window.location.search,
    hash: window.location.hash,
  });
  // 跳转前保存当前url信息
  getPathStorage().set(pathInfo);

  getUserStorage().remove();
  const { clientId, hcpRedirectUrl, hcpUrl } = getHsConfig();
  const { authMode: request_mode, projectFlag: state } = getHsSetting();
  const response_type = 'code';
  const grant_type = 'authorization_code';

  const reqUrl = `${hcpUrl}auth/authorize`;
  const result = `${reqUrl}?client_id=${clientId}&request_mode=${request_mode}&response_type=${response_type}&grant_type=${grant_type}&redirect_uri=${hcpRedirectUrl}&state=${state}`;
  window.location.replace(result);
};

/** 根据授权前保存的url信息跳转页面 */
export const toPage = () => {
  const pathStr = getPathStorage().get();
  const path = pathStr
    ? JSON.parse(pathStr)
    : {
        search: window.location.search,
        hash: window.location.hash,
      };
  const newQuery = new URLSearchParams(window.location.search);
  const ticketVal = newQuery.get(ticketKey);
  // 把微邀请的票据替换掉旧路径中的票据信息
  if (ticketVal) {
    const pathSearch = new URLSearchParams(path.search);
    // 将微邀请的票据替换掉旧路径中的票据信息
    pathSearch.set(ticketKey, ticketVal);
    path.search = `?${pathSearch.toString()}`;
  }
  window.location.replace(`https://${window.location.host}${window.location.pathname}${path.search}${path.hash}`);
  getPathStorage().remove();
};

/** 走微邀请流程,没有中转页 */
export const checkAuth = async () => {
  const user = getHsUserInfo();
  if (user) {
    toPage();
    return true;
  } else {
    // 未登录状态
    const ticketToken = getHsTicket();
    const userInfo = await getUserInfoByTicket();
    // 有票据信息，通过票据获取用户信息
    if (ticketToken && userInfo) {
      getUserStorage().set(JSON.stringify(userInfo));
      toPage();
      return true;
    }
    return false;
  }
};
