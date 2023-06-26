<script setup lang="ts">
// 测试页面，可以在该文件中测试组件
import { AsyncButton, Verify } from './components'
import 'ant-design-vue/es/button/style/css'
import { ref } from 'vue';

const btnText = ref('Click me')

const asyncFn = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  btnText.value = 'Hello World'
}

const verify = ref<typeof Verify>()

// 显示图形验证码
const showVerify = () => {
  verify.value?.show();
}

// 图形验证码验证成功回调
const capctchaCheckSuccess = async (params: any) => {
  console.log(params);
};
</script>

<template>
  <AsyncButton  type="primary" :async-click="asyncFn">
    {{btnText}}
  </AsyncButton>
  <Verify ref="verify" :captcha-type="'blockPuzzle'" :img-size="{ width: '330px', height: '155px' }"
      @success="capctchaCheckSuccess"></Verify>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
