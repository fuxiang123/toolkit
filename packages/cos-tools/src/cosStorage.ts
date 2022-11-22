import COS, { GetAuthorizationCallbackParams } from 'cos-js-sdk-v5';
import { getCosAuthorization } from './api';
/**
 * cos存储桶相关配置
 * TODO: 前端不应存储明文，换为后端验证
 */
const cosConfig = {
  cosRegion: 'ap-guangzhou',
  publicBucketName: 'saas-1258165268',
  privateBucketName: 'saas-private-1258165268',
};

/** cos存储桶单例 */
let cosInstance: COS;

const getAuthorization = async (options, cosCallback) => {
  const res = await getCosAuthorization();
  if (res?.data) {
    const { sessionToken, tmpSecretId, startTime, tmpSecretKey, expiredTime } = res.data;

    cosCallback({
      TmpSecretId: tmpSecretId,
      TmpSecretKey: tmpSecretKey,
      SecurityToken: sessionToken,
      StartTime: startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
      ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000000
      ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用
    } as GetAuthorizationCallbackParams);
  }
};
/** 获取cos实例 */
const getCosInstance = () => {
  if (!cosInstance) {
    cosInstance = new COS({
      getAuthorization,
      UploadCheckContentMd5: true,
    });
    return cosInstance;
  }
  return cosInstance;
};

/** cos上传处理类 */
class CosStorage {
  cosInstance: COS;

  cosConfig: typeof cosConfig;

  constructor() {
    this.cosInstance = getCosInstance();
    this.cosConfig = cosConfig;
  }

  uploadFile(file: File, key: string, config?: COS.PutObjectParams) {
    return new Promise((resolve, reject) => {
      this.cosInstance.putObject(
        {
          ...config,
          Bucket: this.cosConfig.privateBucketName /* 必须 */,
          Region: this.cosConfig.cosRegion /* 存储桶所在地域，必须字段 */,
          Key: key /* 必须 */,
          StorageClass: 'STANDARD',
          Body: file, // 上传文件对象
          // onProgress: function(progressData) {
          //   resolve(JSON.stringify(progressData));
          // }
        },
        (err, data) => {
          if (err) {
            reject('上传失败');
          } else if (data.statusCode === 200) {
            resolve('上传成功');
          }
        },
      );
    }) as Promise<string>;
  }
}

export const cosStorage = new CosStorage();
