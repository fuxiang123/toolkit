import { AxiosRequestConfig } from 'axios';
import { initRequests } from './initRequests';

export interface RequestConfig extends AxiosRequestConfig {
  returnResponse?: boolean; // 是否返回完整response
}

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

  const methodCreator = (method: 'get' | 'post' | 'put' | 'delete') => async (url: string, params?: any, config?: RequestConfig) => {
    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      ...config,
    };

    if (method === 'get' || method === 'delete') {
      requestConfig.params = params;
    } else if (method === 'post' || method === 'put') {
      requestConfig.data = params;
    }

    const res = await request(requestConfig);
    if (config?.returnResponse) return res;
    else if (res?.data) return res.data;
    return undefined;
  };

  const get = methodCreator('get');
  const post = methodCreator('post');
  const put = methodCreator('put');
  const del = methodCreator('delete');

  return {
    requests,
    request,
    get,
    post,
    put,
    del,
  };
};

export default create;
