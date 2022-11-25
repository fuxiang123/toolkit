/* eslint-disable no-param-reassign */
import { AxiosRequestConfig } from 'axios';
import { initRequests } from './initRequests';
import { downLoadFile } from './utils/download';

export const create = (initConfig?: Parameters<typeof initRequests>[0]) => {
  const requests = initRequests(initConfig);
  const requestsInstance = requests.instance;

  const { request } = requestsInstance;

  const get = async (url: string, params?: AxiosRequestConfig['params'], config?: AxiosRequestConfig) => {
    const res = await requests.instance.get(url, {
      ...config,
      params,
    });
    if (res.data) return res.data;
    return undefined;
  };

  const post = async (url: string, data?: AxiosRequestConfig['data'], config?: AxiosRequestConfig) => {
    const res = await requestsInstance.post(url, data, config);
    if (res.data) return res.data;
    return undefined;
  };

  const put = async (url: string, data?: AxiosRequestConfig['data'], config?: AxiosRequestConfig) => {
    const res = await requestsInstance.put(url, data, config);
    if (res.data) return res.data;
    return undefined;
  };

  const del = async (url: string, params?: AxiosRequestConfig['params'], config?: AxiosRequestConfig) => {
    const res = await requestsInstance.delete(url, {
      ...config,
      params,
    });
    if (res.data) return res.data;
    return undefined;
  };

  const download = async (url: string, params?: AxiosRequestConfig['params'], config?: AxiosRequestConfig & { filename?: string }) => {
    const res = await request({
      ...config,
      url,
      params,
      responseType: 'blob',
    });
    downLoadFile(config?.filename ?? '导出文件', res.data.blob);
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
