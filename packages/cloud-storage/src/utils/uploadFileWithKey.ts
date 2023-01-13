import { put, axios, AxiosProgressEvent, CancelTokenSource } from '@neuton/requests';
import { getUploadUrl } from '../api';

/**
 * 通过文件key上传文件
 * @param key 文件key
 * @param file 文件
 * @param onUploadProgress 上传进度回调，同axios的onUploadProgress
 * @param cancelTokenCallback (source: CancelTokenSource) => void 取消上传回调，同axios的CancelToken.source,通过source.cancel()取消上传
 * @returns key 文件key
 */
export async function uploadFileWithKey(
  key: string,
  file: File | Blob,
  onUploadProgress?: (e: AxiosProgressEvent) => void,
  cancelTokenCallback?: (source: CancelTokenSource) => void,
) {
  try {
    if (!key || !file) {
      throw new Error('uploadFileWithKey params: key or file is invalid');
    }

    if (onUploadProgress && typeof onUploadProgress !== 'function') {
      throw new TypeError('progressCallback must be a function.');
    }

    if (cancelTokenCallback && typeof cancelTokenCallback !== 'function') {
      throw new TypeError('cancelTokenCallback must be a function');
    }

    const presignedURL = await getUploadUrl(key);

    const { CancelToken } = axios;
    const source = CancelToken.source();
    if (cancelTokenCallback) {
      cancelTokenCallback(source);
    }

    await put(presignedURL, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: event => {
        if (onUploadProgress) {
          onUploadProgress(event);
        }
      },
      cancelToken: source.token,
    });
    return key;
  } catch (error) {
    if (!axios.isCancel(error)) {
      throw error;
    }
  }
  return undefined;
}
