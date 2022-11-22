import { request } from './utils/request';

/** 获取cos认证信息 */
export const getCosAuthorization = () => request.get('/file/cos/temInfo/secret');

/** 通过fileKey获取资源的下载链接 */
export const getDownloadUrl = (fileKey: string) => request.get('/file/download/url', { params: { key: fileKey } });
