import axios from 'axios';
import { getHsConfig, getHsUserId } from './hsBase';

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
  const trackPram = { ...params, openid };
  if (openid) {
    axios
      .post(`${baseURL}${url}/`, { ...trackPram, openid })
      .then(value => {
        let hsStatue = value;
        if (value.data.code === 200) {
          hsStatue = value.data;
        } else {
          hsStatue = value.data.message;
        }
        trackPram['hsStatus'] = hsStatue;
        customTrack(url, openid, trackPram);
      })
      .catch(error => {
        let err = error;
        if (err.response && err.response.data) {
          err = err.response.data.message || err.response.data;
        } else if (err.message) {
          err = err.message;
        }
        trackPram['hsStatus'] = err;
        customTrack(url, openid, trackPram);
      });
  }
}
