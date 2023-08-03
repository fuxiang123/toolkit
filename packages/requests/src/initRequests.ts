/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-empty-function */
import axios, { Axios, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/** request基础配置 */
export interface RequestsConfig {
  /** 基础url前缀 */
  baseURL?: string;
  /** 后端接口表示请求成功时候的权限码 */
  successAuthCode?: string[];
  /** 传递一个获取token的函数 */
  handleToken?: () => string;
  /** http状态码非200情况处理 */
  handleNetworkError?: (error: AxiosError) => void;
  /** 后端接口状态码（response.code）与successAuthCode不同时候的情况处理 */
  handleAuthError?: (response: AxiosResponse) => void;
  // 通用request处理
  handleRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  // 通用response处理
  handleResponse?: (response: AxiosResponse) => AxiosResponse;
}

export class Requests {
  instance: Axios;

  requestConfig: Omit<RequestsConfig, 'baseURL'> = {};

  constructor(config?: RequestsConfig) {
    this.instance = axios.create({
      headers: {
        Authorization: '',
      },
    });
    this.setRequestConfig(config);
  }

  setBaseUrl = (baseUrl: string) => {
    if (typeof baseUrl === 'string') this.instance.defaults.baseURL = baseUrl;
    else throw new Error('baseUrl必须是一个字符串');
  };

  setRequestConfig = (config?: RequestsConfig) => {
    if (config) {
      const { baseURL, ...rest } = config;
      if (baseURL) this.setBaseUrl(baseURL);
      this.requestConfig = {
        ...this.requestConfig,
        ...rest,
      };
    }
  };
}

export const initRequests = (initConfig?: RequestsConfig) => {
  const requests = new Requests(initConfig);
  const requestsInstance = requests.instance;
  requestsInstance.interceptors.request.use(
    config => {
      const { handleToken, handleRequest } = requests.requestConfig;
      if (handleToken && config.headers) {
        config.headers.Authorization = handleToken() ?? '';
      }

      if (handleRequest) {
        return handleRequest(config);
      }
      return config;
    },
    error => {
      console.error(error);
      return Promise.reject(error);
    },
  );

  requestsInstance.interceptors.response.use(
    response => {
      const { successAuthCode, handleAuthError, handleResponse } = requests.requestConfig;
      const res = response.data;
      if (successAuthCode?.length && !successAuthCode.includes(res.code)) {
        if (handleAuthError) {
          handleAuthError?.(res);
        }
        console.error('接口权限信息报错', res);
        return Promise.reject(res);
      }

      if (handleResponse) {
        return handleResponse(response);
      }

      return res;
    },
    error => {
      requests.requestConfig.handleNetworkError?.(error);
      return Promise.reject(error);
    },
  );

  return requests;
};
