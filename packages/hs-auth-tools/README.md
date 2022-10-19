# `@neuton/hs-auth-tools`

> 集成了火石相关功能的库。包含微邀请和火石埋点功能

## 安装

```
# npm
npm install @neuton/hs-auth-tools
# yarn
yarn add @neuton/hs-auth-tools
# pnpm
pnpm install @neuton/hs-auth-tools

```

## 初始化

```javascript
import { initHsSetting } from '@neuton/hs-auth-tools';

initHsSetting({
  projectFlag: 'cdx', // 必填。当前项目标识
  isTestEnv: false, // 可选。是否是测试环境， 默认false（即默认生产环境）
  useHsTrack: false, // 可选。是否使用火石埋点，默认false
  authMode: 'wechat', // 授权方式, 'wechat' | 'wechat_work' | 'scan'。默认wechat
  disableAuth: false, // 是否禁用火石授权登录流程(微邀请功能)，默认false
});
```

## 使用方式

### 接入微邀请

```vue
<template>
  <HsAuthWrapper>
    <!-- 默认插槽，传入当前应用的根组件 -->
    <template #default>
      <router-view />
    </template>
    <!-- loading插槽， 传入任意loading组件 -->
    <template #loading><VanLoading /></template>
  </HsAuthWrapper>
</template>
<script lang="ts" setup>
import { HsAuthWrapper } from '@neuton/hs-auth-tools';
</script>
```

### 接入火石埋点

```javascript
// 1. 在初始化中启用火石埋点
initHsSetting({
  useHsTrack: true,
});

// 2. 引入hsTrack函数，进行埋点
import { hsTrack } from '@neuton/hs-auth-tools';

hsTrack('埋点点位,如：ld_user_point/chi_ctr_search', {
  // ...埋点参数
});
```

### 打开第三方页面

```javascript
import { openOutPage } from '@neuton/hs-auth-tools';

openOutPage('第三方页面url');
```

### 获取用户信息

```javascript
import { getHsUserId, getHsUserInfo } from '@neuton/hs-auth-tools';

// 获取火石用户id
const userId = getHsUserId();
// 获取火石用户信息
const userInfo = getHsUserInfo();
```
