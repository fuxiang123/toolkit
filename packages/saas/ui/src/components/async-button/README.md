# `AsyncButton`

> 自动处理异步操作的按钮。在异步操作结束前，按钮会一直处于 loading 状态

click 事件必须是一个异步函数（使用 async 语法或者返回一个 Promise）。其余用法与 ant-design-vue 中的[button 组件](https://2x.antdv.com/components/button-cn)保持一致

## 使用方式

```vue
<template>
  <AsyncButton type="primary" :async-click="asyncFn">测试按钮</AsyncButton>
</template>

<script lang="ts">
import { AsyncButton } from '@neuton/saas-ui';

const asyncFn = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
};
</script>
```
