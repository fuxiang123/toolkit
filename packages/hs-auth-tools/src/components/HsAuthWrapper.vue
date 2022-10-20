<template>
  <div v-if="loading" class="hs-auth-loading-wrapper">
    <!-- 页面内容显示出来前的loading 组件 -->
    <slot name="loading"> </slot>
  </div>
  <!-- 页面正文 -->
  <slot v-else-if="hasAuth"></slot>
  <!-- 无权限时显示的页面 -->
  <Remind v-else-if="isWechatMode" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { checkAuth, toOAuth } from '../hslib/hsLogin';
import { getHsSetting } from '../hslib/hsSetting';
import { getPathStorage } from '../storages';
import { getIsWxClient } from '../utils';
import Remind from './Remind.vue';

const hasAuth = ref(false);
const loading = ref(true);
const isWechatMode = ref(false);

onMounted(async () => {
  const isWechat = getIsWxClient();
  const hsSetting = getHsSetting();
  isWechatMode.value = hsSetting.authMode !== 'scan';
  
  if (hsSetting.disableAuth) {
    hasAuth.value = true;
    loading.value = false;
  } else if (isWechat || hsSetting.authMode === 'scan') {
    const authRes = await checkAuth();
    const hasPath = getPathStorage().get();
    if (authRes && !hasPath) {
      hasAuth.value = authRes;
      loading.value = false;
    } else {
      toOAuth();
    }
  } else {
    loading.value = false;
  }
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
