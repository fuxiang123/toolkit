import { AxiosProgressEvent, CancelTokenSource, request, axios } from '@neuton/requests';
import { transByte } from './utils/transByte';
import { getDownloadUrl as getDownloadUrlApi } from './api';
import { generateFileKey } from './generateFileKey';
import { uploadFileWithKey } from './utils/uploadFileWithKey';
import { downloadFileToLocal } from './utils/downloadFileToLocal';

/** 单次上传的配置 */
export interface UploadFileConfig {
  maxFileSize?: number; // 限制本次上传的文件大小， 单位为字节
  fileName?: string; // 为本次上传的文件重新命名
  onUploadProgress?: (e: AxiosProgressEvent) => void; // 上传进度回调，同axios的onUploadProgress
  cancelTokenCallback?: (source: CancelTokenSource) => void; // 取消上传回调，同axios的CancelToken.source,通过source.cancel()取消上传
}

export interface DownloadFileConfig {
  fileName?: string; // 为本次下载的文件重新命名
  onDownloadProgress?: (e: AxiosProgressEvent) => void; // 下载进度回调，同axios的onDownloadProgress
  cancelTokenCallback?: (source: CancelTokenSource) => void; // 取消下载回调，同axios的CancelToken.source,通过source.cancel()取消下载
}

/**
 * 上传文件到cos
 * @param file 上传的文件
 * @param bussinessKey 业务场景标识, 例如:doctor-profile 或 saas/doctor-profile
 * @param uploadConfig.maxFileSize 限制本次上传的文件大小， 单位为字节
 * @param uploadConfig.fileName 为本次上传的文件重新命名
 * @return {Promise<String | undefined>} 返回上传成功的文件key。失败返回undefined
 */
export const uploadFile = async (bussinessKey: string, file: File, uploadConfig?: UploadFileConfig) => {
  if (typeof bussinessKey !== 'string') {
    throw new TypeError('bussinessKey 必须是一个字符串');
  }
  if (!bussinessKey) {
    throw new Error('请先设置config.bussinessKey');
  }
  // 判断文件大小是否超过限制
  const fileSize = uploadConfig?.maxFileSize;
  if (file.size && fileSize) {
    if (file.size > fileSize) {
      const sizeStr = transByte(file.size);
      throw new Error(`文件大小不能超过${sizeStr}`);
    }
  }

  const fileName = uploadConfig?.fileName ?? file.name;
  // 根据文件名和业务场景生成fileKey
  const fileKey = generateFileKey(bussinessKey, fileName);
  const uploadRes = await uploadFileWithKey(fileKey, file, uploadConfig?.onUploadProgress, uploadConfig?.cancelTokenCallback);
  return uploadRes ? fileKey : undefined;
};

export const getDownloadUrl = async (fileKey: string) => {
  const res = await getDownloadUrlApi(fileKey);
  if (typeof res === 'string') {
    return res;
  }
  return undefined;
};

/**
 *
 * @param fileKey 要下载的文件的fileKey，通过后端接口获取
 */
export const downloadFile = async (fileKey: string, downloadConfig: DownloadFileConfig) => {
  const downloadUrl = await getDownloadUrl(fileKey);
  if (downloadUrl) {
    const filename = downloadConfig?.fileName ?? fileKey.split('/').pop() ?? '下载文件';

    // 取消下载功能
    const { CancelToken } = axios;
    const source = CancelToken.source();
    if (downloadConfig.cancelTokenCallback) {
      downloadConfig.cancelTokenCallback(source);
    }

    request({
      url: downloadUrl,
      method: 'get',
      responseType: 'blob',
      onDownloadProgress: downloadConfig?.onDownloadProgress,
      cancelToken: source.token,
    }).then((res: any) => {
      downloadFileToLocal(filename ?? '下载文件', res);
    });
  }
};
