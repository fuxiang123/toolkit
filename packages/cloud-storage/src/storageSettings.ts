import { setRequestConfig } from '@neuton/requests';

export type Environment = 'prod' | 'test';

/** storage用户设置 */
export interface StorageUserSetting {
  env: Environment; // 必传，当前项目运行环境
  projectKey: string; // 必传，配置代表当前项目字符串key
  handleToken?: () => string; // 设置token，如果使用@neuton/requests作为请求库则不需要设置
  // 自定义文件key生成规则
  formatFileKey?: (projectKey: string, filename: string) => string;
}

export type StorageGlobalSetting = Omit<StorageUserSetting, 'handleToken'>;

/** storage全局设置 */
let storageGlobalSetting: StorageGlobalSetting;

/** 设置storage全局配置 */
export const setStorageGlobalSetting = (setting: StorageUserSetting) => {
  const { projectKey, env, handleToken } = setting;
  if (!env) {
    throw new Error('请为cloud-storage配置env参数');
  }

  if (env !== 'prod' && env !== 'test') {
    throw new Error('cloud-storage的env参数只能为prod或test');
  }

  if (!projectKey) {
    throw new Error('请为cloud-storage配置projectKey参数');
  }

  if (typeof projectKey !== 'string') {
    throw new Error('cloud-storage的projectKey参数必须为字符串');
  }

  storageGlobalSetting = setting;

  if (handleToken) {
    setRequestConfig({
      handleToken,
    });
  }
};

/** 获取storage项目标识 */
export const getStorageGlobalSetting = () => {
  return storageGlobalSetting;
};
