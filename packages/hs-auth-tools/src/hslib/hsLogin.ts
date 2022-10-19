import axios from 'axios';
import { useRouter } from 'vue-router';
import { getHsSetting } from './hsSetting';
import { hsProductConfig, hsTestConfig } from '../constants';
import { getHsConfig, getHsUserInfo, getUrlUid } from './hsBase';
import { pathStorage, tokenStorage, userStorage } from '../storages';

/** 获取业务路径 */
export function getUrlPath() {
  const urls = window.location.href.split('#');
  let toPath = '';
  if (urls.length > 1) {
    // eslint-disable-next-line prefer-destructuring
    toPath = urls[1];
  }
  return toPath;
}

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
      return JSON.stringify(res.data['data']);
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
/** 根据票据获取用户信息,票据从链接里获取 */
export async function getUserInfoByUid() {
  const uid = getUrlUid();
  if (uid) {
    const token = await getUserInfoByToken(uid);
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
  const router = useRouter();
  const user = getHsUserInfo();
  let path = pathStorage.get();
  if (!path) {
    path = getUrlPath() ?? '/';
  }
  if (user) {
    pathStorage.remove();
    router.replace(path);
    return true;
  } else {
    const uid = getUrlUid();
    const userInfo = await getUserInfoByUid();
    if (uid && userInfo) {
      userStorage.set(userInfo);
      pathStorage.remove();
      router.replace(path);
      return true;
    }
    pathStorage.set(path);
    return false;
  }
};
