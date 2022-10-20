<template>
  <div v-if="loading" class="hs-auth-loading-wrapper">
    <!-- 页面内容显示出来前的loading 组件 -->
    <slot name="loading"> </slot>
  </div>
  <!-- 页面正文 -->
  <slot v-else-if="hasAuth"></slot>
  <!-- authMode为wechat且无权限时显示的页面 -->
  <Remind v-else-if="isWechatMode" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { checkAuth } from '../hslib/hsLogin';
import { getHsSetting } from '../hslib/hsSetting';
import { getIsWxClient } from '../utils';
import Remind from './Remind.vue';
import { useRouter } from 'vue-router';

const hasAuth = ref(false);
const loading = ref(true);
const isWechatMode = ref(false);
const router = useRouter();

onMounted(async () => {
  await router.isReady()
  const isWechat = getIsWxClient();
  const hsSetting = getHsSetting();
  isWechatMode.value = hsSetting.authMode !== 'scan';

  if (hsSetting.disableAuth) {
    hasAuth.value = true;
    loading.value = false;
    return;
  } 
  
  if (isWechat || hsSetting.authMode === 'scan') {
    const authRes = await checkAuth();
    if (authRes) {
      hasAuth.value = authRes;
      loading.value = false;
    }
  } else {
    loading.value = false;
  }

  window.addEventListener('hashchange', async function(){ 
    const authRes = await checkAuth();
    if (authRes) {
      hasAuth.value = authRes;
      loading.value = false;
    }
  })
});

onUnmounted(() => {
  window.removeEventListener('hashchange', () => {});
});
</script>
<style scoped lang="less">
.hs-auth-loading-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 30%;
}
</style>
