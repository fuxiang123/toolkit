import { get } from '@neuton/requests';
import { getCosGlobalSetting } from './cosSettings';

const getBaseUrl = () => {
  return getCosGlobalSetting().env === 'test' ? 'https://saas-api.vansunscience.com' : 'https://saas-api.neutonhealth.com';
};

/** 获取cos认证信息 */
export const getCosAuthorization = () => get(`${getBaseUrl()}/file/cos/temInfo/secret`);

/** 通过fileKey获取资源的下载链接 */
export const getDownloadUrl = (fileKey: string) => get(`${getBaseUrl()}/file/download/url`, { params: { key: fileKey } });
