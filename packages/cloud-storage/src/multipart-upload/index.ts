import { CompletedPart } from '@aws-sdk/client-s3';
import { generateFileKey } from '../utils/generateFileKey';
import { getAWSInstance } from './getAWSInstance';

interface MultipartUploadConfig {
  storageType?: 'minio' | 'cos'; // 存储类型, 默认cos
  fileName?: string; // 重命名文件名
  partSize?: number; // 分块大小，默认5M
  onUploadProgress?: (e: { total: number; progress: number; loaded: number }) => void; // 上传进度回调，同axios的onUploadProgress
  formatFileKey?: (projectKey: string, fileName: string) => string; // 自定义文件key生成规则
}

// 获取存储桶名称
const getBucketName = (storageType: 'minio' | 'cos' = 'cos') => {
  return storageType === 'minio' ? 'saas-private' : 'saas-private-1258165268';
};

const fileSlice = (file: File, partSize?: number) => {
  // 每一块的文件分片大小
  const size = partSize ?? 1024 * 1024 * 5;
  const totalSize = file.size;
  const num = Math.ceil(totalSize / size);
  const arr: Blob[] = [];
  for (let i = 1; i <= num; i++) {
    let partfile: Blob;
    if (i < num) {
      partfile = file.slice((i - 1) * size, i * size);
    } else {
      partfile = file.slice((i - 1) * size);
    }
    arr.push(partfile);
  }
  return arr;
};

export const createMultipartUpload = async (file: File, config?: MultipartUploadConfig) => {
  const s3 = await getAWSInstance(config?.storageType);
  if (s3 === undefined) return undefined;
  const bucket = getBucketName(config?.storageType);
  const fileKey = generateFileKey(config?.fileName ?? file.name, config?.formatFileKey);
  // 获取uploadId
  const createMultipartUploadRes = await s3.createMultipartUpload({
    Bucket: bucket,
    Key: fileKey,
  });
  if (!createMultipartUploadRes?.UploadId) return undefined;

  const uploadId = createMultipartUploadRes?.UploadId;
  const partFiles = fileSlice(file, config?.partSize);
  // 已经上传过的分块
  const uploadedParts: CompletedPart[] = [];
  // 将要执行的uploadPartCbs分块下标
  let excuteIndex = 0;
  // 是否正在暂停上传
  let isPaused = false;
  // 分块上传参数
  const params = {
    Bucket: bucket,
    Key: fileKey,
    UploadId: uploadId,
  };

  // 上传进度参数
  const progressParams = {
    total: file.size,
    progress: 0,
    loaded: 0,
  };

  // 存储分块上传回调
  const uploadPartCbs = new Array(partFiles.length).fill(null).map((_, index) => {
    const PartNumber = index + 1;
    const partFile = partFiles[index];
    const uploadPart = async () => {
      return s3.uploadPart({
        ...params,
        PartNumber,
        Body: partFile,
      });
    };
    return {
      uploadPart,
      PartNumber,
    };
  });

  // 完成分块上传
  const complete = async () => {
    await s3.completeMultipartUpload({
      ...params,
      MultipartUpload: {
        Parts: uploadedParts,
      },
    });
  };

  // 上传分块
  const upload = async () => {
    if (isPaused) return;

    if (excuteIndex >= uploadPartCbs.length) {
      complete();
      return;
    }
    const cb = uploadPartCbs[excuteIndex];
    if (!cb) return;
    const { PartNumber, uploadPart } = cb;
    const res = await uploadPart();
    // 存储已上传分块
    uploadedParts.push({
      ETag: res.ETag,
      PartNumber,
    });
    // 更新上传进度
    progressParams.loaded += partFiles[excuteIndex].size;
    progressParams.progress = Number((progressParams.loaded / progressParams.total).toFixed(2));
    config?.onUploadProgress?.(progressParams);

    excuteIndex++;
    upload();
  };

  // 暂停上传
  const pause = () => {
    isPaused = true;
  };

  // 恢复上传
  const resume = () => {
    isPaused = false;
    upload();
  };

  // 开始上传
  const start = upload;

  return {
    start,
    pause,
    resume,
  };
};
