import { setRequestConfig } from '@neuton/requests';

export type Environment = 'prod' | 'test';

/** storage全局设置 */
export interface StorageGlobalSetting {
  env: Environment; // 必传，当前项目运行环境
  projectKey: string; // 必传，配置代表当前项目字符串key
  handleToken?: () => string; // 设置token，如果使用@neuton/requests作为请求库则不需要设置
  // 自定义文件key生成规则
  formatFileKey?: (projectKey: string, filename: string) => string;
}

/** storage全局设置 */
const storageGlobalSetting: StorageGlobalSetting = {
  env: 'test', // 当前环境
  projectKey: '',
};

/** 设置storage全局配置 */
export const setStorageGlobalSetting = (setting: StorageGlobalSetting) => {
  const { projectKey, env, formatFileKey, handleToken } = setting;
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

  storageGlobalSetting.env = env;
  storageGlobalSetting.projectKey = projectKey;
  storageGlobalSetting.formatFileKey = formatFileKey;

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
