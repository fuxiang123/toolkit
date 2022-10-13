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
/** 获取本地用户信息 */
export function getLocalUserInfo() {
  return getLocal(userInfoKey);
}
/** 获取本地userId */
export function getLocalUserId() {
  return JSON.parse(getLocal(userInfoKey) ?? '{}').openid ?? '';
}

/** 根据票据获取用户信息,票据从链接里获取 */
export async function getUserInfoByUid(isTest) {
  const uid = getUrlUid();
  const { hsStatisticsUrl } = isTest ? hsTestConfig : hsProductConfig;
  const res = await axios.post(`${hsStatisticsUrl}users/get_user_info/`, { cache_token: uid });
  if (res.data['code'] === 200 && res.data['data']) {
    return JSON.stringify(res.data['data']);
  } else {
    return null;
  }
}
/** 根据票据获取用户信息 */
export async function getUserInfoByToken(token, isTest) {
  const { hsStatisticsUrl } = isTest ? hsTestConfig : hsProductConfig;
  const res = await axios.post(`${hsStatisticsUrl}users/get_user_info/`, { cache_token: token });
  if (res.data['code'] === 200 && res.data['data']) {
    return JSON.stringify(res.data['data']);
  } else {
    return null;
  }
}

/** 获取票据 */
export async function getCacheToken(isTest) {
  const userInfo = JSON.parse(getLocal(userInfoKey) ?? '{}');
  const { hsStatisticsUrl } = isTest ? hsTestConfig : hsProductConfig;
  const res = await axios.post(`${hsStatisticsUrl}users/get_cache_token/`, {
    openid: userInfo.openid,
    user_type: 'cancer',
    expire_date: userInfo.expire_date,
  });
  if (res.data['code'] === 200 && res.data['data'] && res.data['data'][tokenKey]) {
    return res.data['data'][tokenKey];
  } else {
    return null;
  }
}
/** 打开三方页面 */
export async function openOutPage(url, isTest) {
  const token = await getCacheToken(isTest);
  if (token) {
    window.location.href = `${url}?${uidKey}=${token}`;
  } else {
    window.location.href = url;
  }
}
export const hsAuthOptions = (param: { isTest: boolean; state: string; routerFuc: Function }) => {
  const test = param.isTest;
  const hsState = param.state;
  const router = param.routerFuc;

  /** 微邀请之后根据票据获取用户信息 */
  const getUserInfoByUidToAuth = async (faildFuc: Function) => {
    const uid = getUrlUid();
    const userInfo = await getUserInfoByToken(uid, test);
    const path = getSession(pathKey) ?? '/';
    if (userInfo) {
      saveLocal(userInfoKey, userInfo);
      router(path);
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
  const callBackOptions = async authFunc => {
    const uid = getUrlUid();
    if (uid) {
      getUserInfoByUidToAuth(authFunc);
    } else {
      const token = await getCacheToken(test);
      const path = getSession(pathKey) ?? '/';
      if (token) {
        const userInfo = await getUserInfoByToken(token, test);
        if (userInfo) {
          saveLocal(userInfoKey, userInfo);
          router(path);
        } else {
          saveSeesion(pathKey, getUrlPath());
          authFunc();
        }
      } else {
        saveSeesion(pathKey, getUrlPath());
        authFunc();
      }
    }
  };
  const toOAuth = () => {
    clearLocal(userInfoKey);
    const { clientId, hcpRedirectUrl, hcpUrl } = test ? hsTestConfig : hsProductConfig;
    const request_mode = 'wechat';
    const response_type = 'code';
    const grant_type = 'authorization_code';

    const reqUrl = `${hcpUrl}auth/authorize`;
    const result = `${reqUrl}?client_id=${clientId}&request_mode=${request_mode}&response_type=${response_type}&grant_type=${grant_type}&redirect_uri=${hcpRedirectUrl}&state=${hsState}`;
    window.location.replace(result);
  };
  /** 走微邀请流程 */
  const checkAuth = async () => {
    const user = getLocalUserInfo();
    let path = getUrlPath();
    if (path.length === 0 || path === '/') {
      path = getSession(pathKey) ?? '/';
    }
    if (user) {
      const token = await getCacheToken(test);
      if (token) {
        const userInfo = await getUserInfoByToken(token, test);
        if (userInfo) {
          saveLocal(userInfoKey, userInfo);
          router(path);
        } else {
          saveSeesion(pathKey, path);
          toOAuth();
        }
      } else {
        saveSeesion(pathKey, path);
        toOAuth();
      }
    } else {
      const uid = getUrlUid();
      if (uid) {
        const userInfo = await getUserInfoByUid(test);
        if (userInfo) {
          saveLocal(userInfoKey, userInfo);
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
    callBackOptions,
  };
};

export const authFullOption = (param: { hasTokenFunc: Function; authFunc: Function }) => {
  const tokenFunc = param.hasTokenFunc;
  const goAuthFunc = param.authFunc;
  /** 走微邀请流程 */
  const goFullAuth = async () => {
    const user = getLocalUserInfo();
    const uid = getUrlUid();
    let path = getUrlPath();
    if (path.length === 0 || path === '/') {
      path = getSession(pathKey) ?? '/';
    }
    if (user || uid) {
      saveSeesion(pathKey, path);
      tokenFunc();
    } else {
      saveSeesion(pathKey, path);
      goAuthFunc();
    }
  };
  return {
    goFullAuth,
  };
};
