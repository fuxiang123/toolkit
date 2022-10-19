export interface HsUserInfo {
  openid: string;
  nickname: string;
  role: string;
  ip: string;
  expire_date: number;
}

export interface HsSetting {
  isTestEnv?: boolean; // 是否是测试环境
  projectFlag: string; // 当前项目标识
  authMode?: 'wechat' | 'wechat_work' | 'scan'; // 授权方式
  disableAuth?: boolean; // 是否禁用火石授权登录流程，默认false
  initTestUser?: string; // 可选。传入openid，方便在微邀请未打开、无法获取openid的情况下进行测试
}
