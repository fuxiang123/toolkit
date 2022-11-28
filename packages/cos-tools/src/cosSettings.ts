import { setRequestConfig } from '@neuton/requests';

export type Environment = 'prod' | 'test';

/** cos全局设置 */
export interface CosGlobalSetting {
  env: Environment; // 必传，当前项目运行环境
  // 必传，当前项目用到的所有cos业务场景
  scenes: {
    project: string; // 项目标识
    scenes: string[]; // 业务场景标识
  }[];
  handleToken?: () => string; // 设置token，如果使用@neuton/requests作为请求库则不需要设置
  defaultProjectKey?: string; // 默认项目标识, 不传默认为scenes数组中第一个项目标识
  // 自定义文件key生成规则
  formatFileKey?: (params: { project: string; scene: string; fileName: string }) => string;
}

/** cos全局设置 */
const cosGlobalSetting: CosGlobalSetting = {
  env: 'test', // 当前环境
  scenes: [],
};

const getBaseUrl = () => {
  return cosGlobalSetting.env === 'test' ? 'https://saas-api.vansunscience.com' : 'https://saas-api.neutonhealth.com';
};

/** 设置cos全局配置 */
export const setCosGlobalSetting = (setting: CosGlobalSetting) => {
  const { scenes, env, formatFileKey } = setting;
  if (!env) {
    throw new Error('请设置当前环境');
  }

  if (!scenes) {
    throw new Error('清先传递scenes参数,配置所需的cos业务场景');
  }

  if (!scenes?.[0]?.project || !scenes?.[0]?.scenes?.length) {
    throw new Error('请配置至少一个项目标识和业务场景标识');
  }

  cosGlobalSetting.scenes = scenes;
  cosGlobalSetting.env = env;
  cosGlobalSetting.defaultProjectKey = setting.defaultProjectKey ?? scenes[0].project;
  cosGlobalSetting.formatFileKey = formatFileKey;

  if (setting.handleToken) {
    setRequestConfig({
      handleToken: setting.handleToken,
    });
  }
};

/** 获取cos项目标识 */
export const getCosGlobalSetting = () => {
  return cosGlobalSetting;
};
