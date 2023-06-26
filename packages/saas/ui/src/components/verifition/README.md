# `Verify`

> 图形验证码组件

## 使用方式

```vue
<template>
  <Verify ref="verify" :captcha-type="'blockPuzzle'" :img-size="{ width: '330px', height: '155px' }" @success="capctchaCheckSuccess"></Verify>
</template>

<script lang="ts">
import { Verify } from '@neuton/saas-ui';

const verify = ref<typeof Verify>();

// 显示图形验证码
const showVerify = () => {
  verify.value?.show();
};

// 图形验证码验证成功回调
const capctchaCheckSuccess = async (params: any) => {
  console.log(params);
};
</script>
```
