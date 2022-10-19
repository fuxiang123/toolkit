import { initHsTrack } from './hsTrack';

interface HsSetting {
  isTestEnv?: boolean; // 是否是测试环境
  useHsTrack?: boolean; // 是否使用火石埋点
  projectFlag: string; // 当前项目标识
  authMode?: 'wechat' | 'wechat_work' | 'scan'; // 授权方式
  disableAuth?: boolean; // 是否禁用火石授权登录流程，默认false
}

const hsSetting: Omit<HsSetting, 'useHsTrack'> = {
  isTestEnv: false,
  projectFlag: '',
  authMode: 'wechat',
  disableAuth: false,
};

export const getHsSetting = () => {
  if (hsSetting?.projectFlag === '') {
    throw new Error('请先调用initHsSetting，初始化火石配置');
  }
  return hsSetting;
};

/** 初始化火石配置 */
export const initHsSetting = (setting: HsSetting) => {
  const { isTestEnv = false, useHsTrack = false, projectFlag, authMode = 'wechat', disableAuth = false } = setting;
  if (useHsTrack) {
    initHsTrack();
  }

  if (!projectFlag) {
    throw new Error('projectFlag is required');
  }
  hsSetting.isTestEnv = isTestEnv;
  hsSetting.projectFlag = projectFlag;
  hsSetting.authMode = authMode;
  hsSetting.disableAuth = disableAuth;
};
