import { get, request } from '@neuton/requests';
import { getStorageGlobalSetting } from './storageSettings';

const getBaseUrl = () => {
  const { env, baseUrl } = getStorageGlobalSetting();
  if (!env && !baseUrl) throw new Error('请先为@neuton/cloud-storage配置env或baseUrl');
  if (baseUrl) return baseUrl;
  return env === 'test' ? 'https://saas-api.vansunscience.com' : 'https://saas-api.neutonhealth.com';
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

/** 获取临时秘钥 */
export const getTempSecret = async () => {
  const res = (await request({
    url: `${getBaseUrl()}/file/tmpInfo/secret`,
    method: 'GET',
  })) as { code?: string; msg?: string; data: any };
  if (res?.code !== '00000') throw new Error(res?.msg);
  return res?.data;
};
