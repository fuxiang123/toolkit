import { AxiosProgressEvent, request, axios } from '@neuton/requests';
import { transByte } from './utils/transByte';
import { getDownloadUrl as getDownloadUrlApi, getUploadUrl } from './api';
import { generateFileKey } from './generateFileKey';
import { uploadFileToStorage } from './utils/uploadFileToStorage';
import { downloadFileToLocal } from './utils/downloadFileToLocal';

/** 单次上传的配置 */
export interface UploadFileConfig {
  maxFileSize?: number; // 限制本次上传的文件大小， 单位为字节
  fileName?: string; // 为本次上传的文件重新命名
  onUploadProgress?: (e: AxiosProgressEvent) => void; // 上传进度回调，同axios的onUploadProgress
  cancelTokenCallback?: (cancel: () => void) => void; // 取消上传回调，通过调用cancel()取消上传
  formatFileKey?: (projectKey: string, fileName: string) => string; // 自定义文件key生成规则
}

export interface DownloadFileConfig {
  fileName?: string; // 为本次下载的文件重新命名
  onDownloadProgress?: (e: AxiosProgressEvent) => void; // 下载进度回调，同axios的onDownloadProgress
  cancelTokenCallback?: (cancel: () => void) => void; // 取消上传回调，通过调用cancel()取消上传
}

/**
 * 上传文件
 * @param file 上传的文件
 * @param bussinessKey 业务场景标识, 例如:doctor-profile 或 saas/doctor-profile
 * @param uploadConfig.maxFileSize 限制本次上传的文件大小， 单位为字节
 * @param uploadConfig.fileName 为本次上传的文件重新命名
 * @return {Promise<String | undefined>} 返回上传成功的文件key。失败返回undefined
 */
export const uploadFile = async (file: File, uploadConfig?: UploadFileConfig) => {
  // 判断文件大小是否超过限制
  const fileSize = uploadConfig?.maxFileSize;
  if (file.size && fileSize) {
    if (file.size > fileSize) {
      const sizeStr = transByte(file.size);
      throw new Error(`文件大小不能超过${sizeStr}`);
    }
  }

  const fileName = uploadConfig?.fileName ?? file.name;
  // 生成文件Key
  const fileKey = generateFileKey(fileName, uploadConfig?.formatFileKey);
  // 获取上传预签名链接
  const presignedURL = await getUploadUrl(fileKey);
  // 上传文件
  const uploadRes = await uploadFileToStorage(presignedURL, file, uploadConfig?.onUploadProgress, uploadConfig?.cancelTokenCallback);
  return uploadRes ? fileKey : undefined;
};

export const getFileUrl = async (fileKey: string) => {
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
export const downloadFile = async (fileKey: string, downloadConfig?: DownloadFileConfig) => {
  const downloadUrl = await getFileUrl(fileKey);
  if (downloadUrl) {
    const filename = downloadConfig?.fileName ?? fileKey.split('/').pop() ?? '下载文件';

    // 取消下载功能
    const { CancelToken } = axios;
    const source = CancelToken.source();
    if (downloadConfig?.cancelTokenCallback) {
      downloadConfig.cancelTokenCallback(source.cancel);
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
