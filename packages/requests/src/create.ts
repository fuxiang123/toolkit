/* eslint-disable no-param-reassign */
import { AxiosRequestConfig } from 'axios';
import { initRequests } from './initRequests';
import { downLoadFile } from './utils/downloadFile';
/*!
 * 创建一个请求实例
 * @param initConfig 初始化配置
 * @returns requests 请求实例
 * @returns request 基础请求函数，与axios.request相同
 * @returns download 下载文件函数
 * @returns get/post/put/del 基础请求函数
 */
export const create = (initConfig?: Parameters<typeof initRequests>[0]) => {
  const requests = initRequests(initConfig);
  const requestsInstance = requests.instance;

  const { request } = requestsInstance;

  const get = async (url: string, params?: AxiosRequestConfig['params'], config?: AxiosRequestConfig) => {
    const res = await requests.instance.get(url, {
      ...config,
      params,
    });
    if (res?.data) return res.data;
    return undefined;
  };

  const post = async (url: string, data?: AxiosRequestConfig['data'], config?: AxiosRequestConfig) => {
    const res = await requestsInstance.post(url, data, config);
    if (res?.data) return res.data;
    return undefined;
  };

  const put = async (url: string, data?: AxiosRequestConfig['data'], config?: AxiosRequestConfig) => {
    const res = await requestsInstance.put(url, data, config);
    if (res?.data) return res.data;
    return undefined;
  };

  const del = async (url: string, params?: AxiosRequestConfig['params'], config?: AxiosRequestConfig) => {
    const res = await requestsInstance.delete(url, {
      ...config,
      params,
    });
    if (res?.data) return res.data;
    return undefined;
  };

  const download = async (url: string, params?: AxiosRequestConfig['params'], config?: AxiosRequestConfig & { filename?: string }) => {
    const res = await request({
      ...config,
      url,
      params,
      responseType: 'blob',
    });
    if (res?.data?.blob) {
      downLoadFile(config?.filename ?? '导出文件', res.data.blob);
    } else {
      throw new Error('下载文件失败, 未检测到返回的blob数据');
    }
  };

  return {
    requests,
    request,
    get,
    post,
    put,
    del,
    download,
  };
};

export default create;
