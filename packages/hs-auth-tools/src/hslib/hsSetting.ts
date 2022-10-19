import { HsSetting } from './types';

let hsSetting: Omit<HsSetting, 'useHsTrack'> = {
  isTestEnv: false,
  projectFlag: '',
  authMode: 'wechat',
  disableAuth: false,
  initTestUser: '',
};

// 获取火石配置
export const getHsSetting = () => {
  if (hsSetting?.projectFlag === '') {
    throw new Error('请先调用initHsSetting，初始化火石配置');
  }
  return hsSetting;
};

/** 初始化火石配置 */
export const initHsSetting = (setting: HsSetting) => {
  if (!setting.projectFlag) {
    throw new Error('projectFlag is required');
  }
  hsSetting = setting;
};
