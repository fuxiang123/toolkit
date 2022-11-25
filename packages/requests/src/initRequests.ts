/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-empty-function */
import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';

/** request基础配置 */
export interface RequestsConfig {
  /** 基础url前缀 */
  baseURL?: string;
  /** 后端接口表示请求成功时候的权限码 */
  successAuthCode?: string[];
  /** 传递一个获取token的函数 */
  handleToken?: () => string;
  /** 请求头处理 */
  handleRequestHeader?: (headers: AxiosRequestConfig['headers']) => AxiosRequestConfig['headers'];
  /** http状态码非200情况处理 */
  handleNetworkError?: (httpStatus: number | undefined) => void;
  /** 后端接口状态码（response.code）与successAuthCode不同时候的情况处理 */
  handleAuthError?: (data: AxiosResponse['data']) => void;
}

export class Requests {
  instance: Axios;

  requestConfig = {
    successAuthCode: [] as string[],
    token: '',
    handleRequestHeader: headers => headers,
    handleNetworkError: (() => {}) as RequestsConfig['handleNetworkError'],
    handleAuthError: (() => {}) as RequestsConfig['handleAuthError'],
  };

  constructor(config?: RequestsConfig) {
    this.instance = axios.create(config);
    this.setRequestConfig(config);
  }

  setToken = (token: string) => {
    if (typeof token === 'string') this.requestConfig.token = token;
    else throw new Error('token必须是一个字符串');
  };

  setBaseUrl = (baseUrl: string) => {
    if (typeof baseUrl === 'string') this.instance.defaults.baseURL = baseUrl;
    else throw new Error('baseUrl必须是一个字符串');
  };

  setRequestConfig = (config?: RequestsConfig) => {
    if (config) {
      const { baseURL, handleToken, ...rest } = config;

      if (baseURL) this.setBaseUrl(baseURL);
      if (handleToken) this.setToken(handleToken());

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
  const { requestConfig } = requests;
  const { handleAuthError, handleNetworkError, handleRequestHeader } = requestConfig;

  requestsInstance.interceptors.request.use(
    config => {
      if (requestConfig.token && config?.headers) {
        config.headers.Authorization = requestConfig.token;
      }
      config.headers = handleRequestHeader(config.headers);
      return config;
    },
    error => {
      console.error(error);
      return Promise.reject(error);
    },
  );

  requestsInstance.interceptors.response.use(
    response => {
      const res = response.data;
      if (requestConfig.successAuthCode?.length && !requestConfig.successAuthCode.includes(res.code)) {
        handleAuthError?.(res);
        console.error('接口权限信息报错', res);
        return Promise.reject(new Error(res.msg ?? 'Error'));
      }
      return res;
    },
    error => {
      handleNetworkError?.(error.response?.status);
      console.error(`接口返回报错${error}`);
      return Promise.reject(error);
    },
  );

  return requests;
};
