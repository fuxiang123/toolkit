import COS, { GetAuthorizationCallbackParams } from 'cos-js-sdk-v5';
import { getCosAuthorization } from './api';

/**
 * cos存储桶相关配置
 */
const cosConfig = {
  secretId: 'AKIDymMhndIitpVw73jAMIyPbXEgspWx96oG',
  secretKey: 'GG1WljcHhtqXzB8pHUSAcpnX2KPFrFPK',
  cosRegion: 'ap-guangzhou',
  publicBucketName: 'saas-1258165268',
  privateBucketName: 'saas-private-1258165268',
};

/** cos权限认证 */
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

/** cos存储桶单例 */
let cosInstance: COS;

/** 获取cos实例 */
const getCosInstance = () => {
  if (!cosInstance) {
    cosInstance = new COS({
      SecretId: cosConfig.secretId,
      SecretKey: cosConfig.secretKey,
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

  async uploadFile(file: File, key: string, config?: COS.PutObjectParams) {
    const res = await this.cosInstance.putObject({
      ...config,
      Bucket: this.cosConfig.privateBucketName /* 必须 */,
      Region: this.cosConfig.cosRegion /* 存储桶所在地域，必须字段 */,
      Key: key /* 必须 */,
      StorageClass: 'STANDARD',
      Body: file, // 上传文件对象
    });
    return res;
  }

  download(fileKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cosInstance.getObject(
        {
          Bucket: cosConfig.privateBucketName,
          Region: cosConfig.cosRegion,
          Key: fileKey,
          DataType: 'blob',
        },
        (err, data) => {
          if (err) reject('下载失败，请重试！');
          else resolve(data.Body);
        },
      );
    });
  }
}

export const cosStorage = new CosStorage();
