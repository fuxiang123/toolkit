import axios from 'axios';
import urlParse from 'url-parse';
import { getHsSetting } from './hsSetting';
import { hsProductConfig, hsTestConfig, ticketKey } from '../constants';
import { getHsConfig, getHsUserInfo, getHsTicket } from './hsBase';
import { pathStorage, tokenStorage, userStorage } from '../storages';
import { HsUserInfo } from './types';

/** 根据票据获取用户信息 */
export async function getUserInfoByToken(token: string) {
  const { hsStatisticsUrl } = getHsSetting().isTestEnv ? hsTestConfig : hsProductConfig;
  const localToken = tokenStorage.get();
  if (token === localToken) {
    return getHsUserInfo();
  }
  try {
    const res = await axios.post(`${hsStatisticsUrl}users/get_user_info/`, { cache_token: token });
    if (res.data['code'] === 200 && res.data['data']) {
      tokenStorage.set(token);
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
  userStorage.remove();
  const { clientId, hcpRedirectUrl, hcpUrl } = getHsConfig();
  const { authMode: request_mode, projectFlag: state } = getHsSetting();
  const response_type = 'code';
  const grant_type = 'authorization_code';

  const reqUrl = `${hcpUrl}auth/authorize`;
  const result = `${reqUrl}?client_id=${clientId}&request_mode=${request_mode}&response_type=${response_type}&grant_type=${grant_type}&redirect_uri=${hcpRedirectUrl}&state=${state}`;
  window.location.replace(result);
};

/** 走微邀请流程,没有中转页 */
export const checkAuth = async () => {
  const user = getHsUserInfo();
  let path = pathStorage.get();

  if (!path) {
    path = window.location.href ?? '/';
  }
  if (user) {
    const newQuery = new URLSearchParams(window.location.search);
    // 把微邀请的票据替换掉旧路径中的票据信息
    if (newQuery.get(ticketKey)) {
      const url = urlParse(path);
      // 获取存储的路径中的query
      const oldQuery = new URLSearchParams(url.query);
      // 将微邀请的票据替换掉旧路径中的票据信息
      oldQuery.set(ticketKey, newQuery[ticketKey]);
      url.set('query', oldQuery.toString());
      path = url.toString();
    }
    // 已经登录状态
    pathStorage.remove();
    window.location.replace(path);
    return true;
  } else {
    // 未登录状态
    const ticketToken = getHsTicket();
    const userInfo = await getUserInfoByTicket();
    // 有票据信息，通过票据获取用户信息
    if (ticketToken && userInfo) {
      userStorage.set(JSON.stringify(userInfo));
      pathStorage.remove();
      return true;
    }

    // 保存当前路径
    pathStorage.set(path);
    // 没有票据信息，返回false
    return false;
  }
};
