import axios, { AxiosRequestConfig } from 'axios';
import { downLoadFile } from './downloadFIle';

/**
 * 获取Token
 * @param hasBearer 是否添加Bearer认证头
 */
export function getToken(hasBearer = false): string {
  const _authorization = localStorage.getItem('Authorization');
  if (_authorization) {
    return hasBearer ? `Bearer ${_authorization}` : _authorization;
  }
  return '';
}

interface DownloadConfig extends AxiosRequestConfig {
  filename?: string;
}

/** 通用下载方法 */
function download(url, params, { filename = '导出文件', method = 'post', ...config }: DownloadConfig) {
  return axios
    .request({
      url,
      params,
      headers: {
        /** 获取用户身份校验信息（jwt） */
        Authorization: getToken(true) ?? '',
        'Content-Type': 'application/x-www-form-urlencoded',
        ...config.headers,
      },
      responseType: 'blob',
      method,
      ...config,
    })
    .then(res => {
      if (res.data instanceof Blob) {
        downLoadFile(filename, res.data);
      }
    })
    .catch(() => {
      throw new Error('下载文件出现错误，请联系管理员！');
    });
}

const get = (url: string, params?: unknown) =>
  axios.request({
    url,
    params,
    headers: {
      /** 获取用户身份校验信息（jwt） */
      Authorization: getToken(true) ?? '',
    },
    method: 'get',
  });

// TODO: 请求库完成后，这里需要修改
export const request = {
  get,
  download,
};
