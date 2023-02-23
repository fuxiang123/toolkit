import { S3 } from '@aws-sdk/client-s3';
import { getTempSecret } from '../api';

let awsInstance: S3;

export const getAWSInstance = async (storageType: 'minio' | 'cos' = 'cos') => {
  if (awsInstance) return awsInstance;
  const res = await getTempSecret();
  if (res?.tmpSecretId && res?.tmpSecretKey && res?.sessionToken) {
    const { tmpSecretId, sessionToken, tmpSecretKey } = res;
    if (storageType === 'cos') {
      awsInstance = new S3({
        region: 'ap-guangzhou',
        endpoint: 'https://cos.ap-guangzhou.myqcloud.com',
        credentials: {
          accessKeyId: tmpSecretId, // 访问登录名
          secretAccessKey: tmpSecretKey, // 访问密码
          sessionToken,
        },
      });
    } else {
      awsInstance = new S3({
        region: 'ap-guangzhou',
        endpoint: 'https://cos.ap-guangzhou.myqcloud.com',
        credentials: {
          accessKeyId: tmpSecretId, // 访问登录名
          secretAccessKey: tmpSecretKey, // 访问密码
          sessionToken,
        },
      });
    }
    return awsInstance;
  } else {
    throw new Error('获取临时秘钥失败');
  }
};
