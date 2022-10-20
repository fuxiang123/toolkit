import axios from 'axios';
import { getHsSetting } from './hsSetting';
import { hsProductConfig, hsTestConfig, tokenKey, ticketKey } from '../constants';
import { getUserStorage } from '../storages';
import { getQueryVariable } from '../utils';
import { HsUserInfo } from './types';

/** 获取hs配置 */
export const getHsConfig = () => {
  return getHsSetting().isTestEnv ? hsTestConfig : hsProductConfig;
};

/** 获取微邀请票据信息 */
export const getHsTicket = () => {
  return getQueryVariable(ticketKey);
};

/** 获取本地用户信息,如果过期返回null */
export function getHsUserInfo(): HsUserInfo | null {
  const userInfoJson = getUserStorage().get();
  if (userInfoJson) {
    const userInfo = JSON.parse(userInfoJson);
    const { expire_date } = userInfo;
    const now = new Date().getTime();
    if (now > expire_date) {
      getUserStorage().remove();
      return null;
    } else {
      return userInfo;
    }
  } else {
    return null;
  }
}

/** 获取本地userId */
export function getHsUserId() {
  const userInfo = getHsUserInfo();
  if (userInfo) {
    return userInfo.openid;
  } else {
    const { disableAuth, isTestEnv, initTestUser } = getHsSetting();
    // 如果禁用了登录流程，返回一个测试用户
    if (isTestEnv && disableAuth) {
      return initTestUser;
    }
    return '';
  }
}

/** 获取票据 */
export async function getCacheToken() {
  const userInfo = getHsUserInfo();
  if (userInfo) {
    const { openid, expire_date } = userInfo;
    const { hsStatisticsUrl } = getHsConfig();
    try {
      const res = await axios.post(`${hsStatisticsUrl}users/get_cache_token/`, {
        openid,
        user_type: 'cancer',
        expire_date,
      });
      if (res.data['code'] === 200 && res.data['data'] && res.data['data'][tokenKey]) {
        return res.data['data'][tokenKey];
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  } else {
    return null;
  }
}

/** 打开三方页面 */
export async function openOutPage(url: string) {
  const usetInfo = getHsUserInfo();
  let token;
  if (usetInfo) {
    token = await getCacheToken();
  }
  if (token) {
    if (url.indexOf('#') > -1) {
      const index = url.indexOf('#');
      const indexUrl = url.substring(0, index);
      if (indexUrl.indexOf('?') > -1) {
        let newIndexUrl = `${indexUrl}&${ticketKey}=${token}`;
        newIndexUrl = url.replace(indexUrl, newIndexUrl);
        window.location.href = newIndexUrl;
      } else {
        let newIndexUrl = `${indexUrl}?${ticketKey}=${token}`;
        newIndexUrl = url.replace(indexUrl, newIndexUrl);
        window.location.href = newIndexUrl;
      }
    } else if (url.indexOf('?') > -1) {
      window.location.href = `${url}&${ticketKey}=${token}`;
    } else {
      window.location.href = `${url}?${ticketKey}=${token}`;
    }
  } else {
    window.location.href = url;
  }
}
