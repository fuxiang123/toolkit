import axios from 'axios';
import { getHsConfig, getHsUserId, getUrlUid } from './hsBase';
import { getQueryVariable } from '../utils';

// hs埋点
export const initHsTrack = () => {
  const code = getUrlUid();
  // 火石跳转过来的链接携带cancer参数，统计的时候app_from字段传该参数
  const cancer = getQueryVariable('cancer');
  if (cancer) {
    sessionStorage.setItem('hs_cancer', cancer);
  } else if (!code) {
    // 没有认证的时候删除存的参数值
    sessionStorage.removeItem('hs_cancer');
  }
};

/**
 * 统计的数据转换成json字符串存在自己的服务器上
 */
function customTrack(url: string, openid: string, params: object) {
  const data = {
    url,
    openid,
    params: Object.keys(params).length > 0 ? JSON.stringify(params) : '',
  };
  axios.post('frontend/addAccessLog', data);
}

/**
 * 火石埋点
 * @param url 埋点路径
 * @param params 埋点参数
 */
export function hsTrack(url: string, params: object = {}) {
  const baseURL = getHsConfig().hsStatisticsUrl;
  const openid = getHsUserId();
  const app_from = sessionStorage.getItem('hs_cancer') ?? 'H5';
  const trackPram = { ...params, app_from, openid };
  if (openid) {
    customTrack(url, openid, trackPram);
    return axios.post(`${baseURL}${url}/`, { ...trackPram, openid }) as Promise<{ data: { data: { id: string } } }>;
  }
  return undefined;
}
