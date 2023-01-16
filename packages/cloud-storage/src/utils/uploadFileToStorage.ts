import { put, axios, AxiosProgressEvent } from '@neuton/requests';

/**
 * 通过文件key上传文件
 * @param presignedURL 预签名链接
 * @param file 文件
 * @param onUploadProgress 上传进度回调，同axios的onUploadProgress
 * @param cancelTokenCallback 取消上传回调，同axios的CancelToken.source,通过调用cancel()取消上传
 * @returns boolean | undefined 上传成功返回true，取消上传返回undefined
 */
export async function uploadFileToStorage(
  presignedURL: string,
  file: File | Blob,
  onUploadProgress?: (e: AxiosProgressEvent) => void,
  cancelTokenCallback?: (cancel: () => void) => void,
) {
  try {
    if (onUploadProgress && typeof onUploadProgress !== 'function') {
      throw new TypeError('progressCallback must be a function.');
    }

    if (cancelTokenCallback && typeof cancelTokenCallback !== 'function') {
      throw new TypeError('cancelTokenCallback must be a function');
    }

    // 处理axios取消请求功能
    const { CancelToken } = axios;
    const source = CancelToken.source();
    if (cancelTokenCallback) {
      cancelTokenCallback(source.cancel);
    }

    await put(presignedURL, file, {
      headers: { 'Content-Type': file.type },
      // axios上传进度回调
      onUploadProgress: event => {
        if (onUploadProgress) {
          onUploadProgress(event);
        }
      },
      cancelToken: source.token,
    });

    return true;
  } catch (error) {
    if (!axios.isCancel(error)) {
      throw error;
    }
  }
  return undefined;
}
