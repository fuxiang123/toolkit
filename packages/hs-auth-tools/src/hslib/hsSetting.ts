import { initHsTrack } from './hsTrack';
import { HsSetting } from './types';

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
