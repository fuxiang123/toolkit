// 是否是微信客户端
export function getIsWxClient() {
  const ua = navigator.userAgent.toLowerCase();
  const matchArr = ua.match(/MicroMessenger/i);
  if (matchArr && matchArr.length > 0 && matchArr[0] === 'micromessenger') {
    return true;
  }
  return false;
}

// 获取url中的参数
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
