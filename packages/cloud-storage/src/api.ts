import { get, put, AxiosProgressEvent } from '@neuton/requests';
import { getStorageGlobalSetting } from './storageSettings';

const getBaseUrl = () => {
  return getStorageGlobalSetting().env === 'test' ? 'https://saas-api.vansunscience.com' : 'https://saas-api.neutonhealth.com';
};

/**
 * 生成预签名链接
 * @param fileKey 文件key
 * @param method 请求方法, 获取上传链接时为PUT, 获取下载链接时为GET
 */
const generatePresignedUrl = (key: string, method: string) => get(`${getBaseUrl()}/file/generate-presigned-url`, { key, method });

/** 获取资源的下载链接 */
export const getDownloadUrl = (fileKey: string) => generatePresignedUrl(fileKey, 'GET');

/** 获取资源的上传链接 */
export const getUploadUrl = (fileKey: string) => generatePresignedUrl(fileKey, 'PUT');
