import axios from 'axios';

const hsTestConfig = {
  clientId: 'zhongliu',
  hsUrl: 'https://msd-tumor-h5.aihuoshi.net/',
  hcpUrl: 'https://vapitst.msdp.cn/',
  hcpRedirectUrl: 'https://msd-tumor-h5.aihuoshi.net/',
  hsStatisticsUrl: 'https://msd-user-management.aihuoshi.net/',
};

const hsProductConfig = {
  clientId: 'eFvEUbWSY1AS',
  hsUrl: 'https://msd-tumor-h5.hsmap.com/',
  hcpUrl: ' https://vapi.msdp.cn/',
  hcpRedirectUrl: 'https://msd-tumor-h5.hsmap.com',
  hsStatisticsUrl: 'https://msd-user-management.aimed.cn/',
};

export const userInfoKey = 'userInfo';
export const pathKey = 'cdxToPath';
const uidKey = 'ticket';
const tokenKey = 'cache_token';
export function getQueryVariable(queryName) {
  const query = decodeURI(window.location.search.substring(1));
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === queryName) {
      return pair[1];
    }
  }
  return null;
}

export function saveLocal(key: string, value: string) {
  localStorage.setItem(key, value);
}
export function getLocal(key: string) {
  return localStorage.getItem(key);
}

export function saveSeesion(key: string, value: string) {
  sessionStorage.setItem(key, value);
}

export function getSession(key: string) {
  return sessionStorage.getItem(key);
}
export function clearLocal(key: string) {
  localStorage.removeItem(key);
}

export function clearSeesion(key: string) {
  sessionStorage.removeItem(key);
}
/** 获取微邀请票据 */
export function getUrlUid() {
  return getQueryVariable(uidKey);
}
export function getIsWxClient() {
  const ua = navigator.userAgent.toLowerCase();
  const matchArr = ua.match(/MicroMessenger/i);
  if (matchArr && matchArr.length > 0 && matchArr[0] === 'micromessenger') {
    return true;
  }
  return false;
}

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
/** 获取本地用户信息,如果过期返回null */
export function getLocalUserInfo() {
  const userInfo = getLocal(userInfoKey);
  if (userInfo) {
    const { expire_date } = JSON.parse(userInfo);
    const now = new Date().getTime();
    if (now > expire_date) {
      clearLocal(userInfoKey);
      return null;
    } else {
      return userInfo;
    }
  } else {
    return null;
  }
}
/** 获取本地userId */
export function getLocalUserId() {
  const userInfo = getLocalUserInfo();
  if (userInfo) {
    return JSON.parse(userInfo).openid;
  } else {
    return '';
  }
}

/** 根据票据获取用户信息 */
export async function getUserInfoByToken(token: string, isTest: boolean) {
  const { hsStatisticsUrl } = isTest ? hsTestConfig : hsProductConfig;
  const localToken = getSession(tokenKey);
  if (token === localToken) {
    return getLocalUserInfo();
  }
  try {
    const res = await axios.post(`${hsStatisticsUrl}users/get_user_info/`, { cache_token: token });
    if (res.data['code'] === 200 && res.data['data']) {
      saveSeesion(tokenKey, token);
      return JSON.stringify(res.data['data']);
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
/** 根据票据获取用户信息,票据从链接里获取 */
export async function getUserInfoByUid(isTest: boolean) {
  const uid = getUrlUid();
  if (uid) {
    const token = await getUserInfoByToken(uid, isTest);
    return token;
  } else {
    return null;
  }
}

/** 获取票据 */
export async function getCacheToken(isTest: boolean) {
  const userInfo = getLocalUserInfo();
  if (userInfo) {
    const { openid, expire_date } = JSON.parse(userInfo);
    const { hsStatisticsUrl } = isTest ? hsTestConfig : hsProductConfig;
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
export async function openOutPage(url: string, isTest: boolean) {
  const usetInfo = getLocalUserInfo();
  let token;
  if (usetInfo) {
    token = await getCacheToken(isTest);
  }
  if (token) {
    if (url.indexOf('#') > -1) {
      const index = url.indexOf('#');
      const indexUrl = url.substring(0, index);
      if (indexUrl.indexOf('?') > -1) {
        let newIndexUrl = `${indexUrl}&${uidKey}=${token}`;
        newIndexUrl = url.replace(indexUrl, newIndexUrl);
        window.location.href = newIndexUrl;
      } else {
        let newIndexUrl = `${indexUrl}?${uidKey}=${token}`;
        newIndexUrl = url.replace(indexUrl, newIndexUrl);
        window.location.href = newIndexUrl;
      }
    } else if (url.indexOf('?') > -1) {
      window.location.href = `${url}&${uidKey}=${token}`;
    } else {
      window.location.href = `${url}?${uidKey}=${token}`;
    }
  } else {
    window.location.href = url;
  }
}
/**
 * 微邀请api集合
 * @param {boolean} isTest 是否是测试环境
 * @param {string} state 火石注册state
 * @param {Function} routerFuc 转跳方法
 * @param {string}authMode 授权方式 //'wechat'微信,'wechat_work'企业微信,'scan'pc端二维码

 * @returns
 */
export const hsAuthOptions = (param: { isTest: boolean; state: string; routerFuc: (path: string) => void; authMode?: string }) => {
  const test = param.isTest;
  const hsState = param.state;
  const router = param.routerFuc;
  const authMode = param.authMode ?? 'wechat';
  /** 是否执行过微邀请流程 */
  const hasAuth = () => {
    const path = getSession(pathKey);
    if (path) {
      return true;
    } else {
      return false;
    }
  };
  /** 微邀请之后根据票据获取用户信息
   * @param {Function} faildFuc 获取失败callback
   */
  const getUserInfoByUidToAuth = async (succFuc: () => void, faildFuc: () => void) => {
    const uid = getUrlUid();
    const userInfo = await getUserInfoByToken(uid ?? '', test);
    let path = getSession(pathKey);
    if (!path) {
      path = getUrlPath() ?? '/';
    }
    if (userInfo) {
      saveLocal(userInfoKey, userInfo);
      succFuc();
      clearSeesion(pathKey);
    } else {
      saveSeesion(pathKey, path);
      faildFuc();
    }

    /**
         * {
  "code": 200,
  "message": "success",
  "data": {
    "openid": "oM17MwTW7xqZjX1PqM6LD63ANpys",
    "nickname": "明天你好",
    "role": "hcp",
    "ip": "117.147.2.74",
    "expire_date": 1665483952563 // 缓存过期时间 单位毫秒
  }
}
         * 
         */
  };
  /** 获取用户信息（在callBacll中转页调用）
   * @param faildFuc 获取失败callBack
   */
  const getUserInfoOptionsInUserBack = async (faildFuc: () => void) => {
    const uid = getUrlUid();
    const path = getSession(pathKey) ?? '/';

    if (uid) {
      const userInfo = await getUserInfoByToken(uid ?? '', test);
      if (userInfo) {
        saveLocal(userInfoKey, userInfo);
        clearSeesion(pathKey);
        router(path);
      } else {
        saveSeesion(pathKey, path);
        faildFuc();
      }
    } else {
      const userInfo = getLocalUserInfo();
      if (userInfo) {
        saveLocal(userInfoKey, userInfo);
        clearSeesion(pathKey);
        router(path);
      }
    }
  };

  /** 获取用户信息（直接调用）
   * @param faildFuc 获取失败callBack
   * @param succFuc 获取成功
   */
  const getUserInfoOptions = async (succFuc: () => void, faildFuc: () => void) => {
    const uid = getUrlUid();
    if (uid) {
      getUserInfoByUidToAuth(succFuc, faildFuc);
    } else {
      const userInfo = getLocalUserInfo();
      if (userInfo) {
        succFuc();
      } else {
        if (!hasAuth()) {
          saveSeesion(pathKey, getUrlPath());
        }
        faildFuc();
      }
    }
  };
  /** 授权登录 */
  const toOAuth = () => {
    clearLocal(userInfoKey);
    const { clientId, hcpRedirectUrl, hcpUrl } = test ? hsTestConfig : hsProductConfig;
    const request_mode = authMode;
    const response_type = 'code';
    const grant_type = 'authorization_code';

    const reqUrl = `${hcpUrl}auth/authorize`;
    const result = `${reqUrl}?client_id=${clientId}&request_mode=${request_mode}&response_type=${response_type}&grant_type=${grant_type}&redirect_uri=${hcpRedirectUrl}&state=${hsState}`;
    window.location.replace(result);
  };
  /** 走微邀请流程,没有中转页 */
  const checkAuth = async () => {
    const user = getLocalUserInfo();
    let path = getSession(pathKey);
    if (!path) {
      path = getUrlPath() ?? '/';
    }
    if (user) {
      clearSeesion(pathKey);
      router(path);
    } else {
      const uid = getUrlUid();
      if (uid) {
        const userInfo = await getUserInfoByUid(test);
        if (userInfo) {
          saveLocal(userInfoKey, userInfo);
          clearSeesion(pathKey);
          router(path);
        } else {
          saveSeesion(pathKey, path);
          toOAuth();
        }
      } else {
        saveSeesion(pathKey, path);
        toOAuth();
      }
    }
  };

  return {
    toOAuth,
    checkAuth,
    getUserInfoOptions,
    getUserInfoOptionsInUserBack,
    getUserInfoByUidToAuth,
    hasAuth,
  };
};
// //由于流程修改了，并且在微信浏览器，使用中间页，点击复制的时候，链接不会及时更新（但是点击分享的链接是正确的）
// export const authFullOption = (param: { hasTokenFunc: () => void; authFunc: () => void; isTest: boolean }) => {
//   const tokenFunc = param.hasTokenFunc;
//   const goAuthFunc = param.authFunc;
//   const test = param.isTest;
//   /** 走微邀请流程 */
//   const goFullAuth = async () => {
//     const user = getLocalUserInfo();
//     const uid = getUrlUid();
//     // 先判断是否有缓存path，如果有则使用缓存path，没有则使用自己的path
//     let path = getSession(pathKey);
//     if (!path) {
//       path = getUrlPath() ?? '/';
//     }
//     if (!user) {
//       if (uid) {
//         saveSeesion(pathKey, path);
//         tokenFunc();
//       } else {
//         saveSeesion(pathKey, path);
//         goAuthFunc();
//       }
//     }else{

//     }
//   };
//   return {
//     goFullAuth,
//   };
// };
