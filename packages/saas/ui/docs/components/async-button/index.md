---
layout: doc
---

<script setup>
import Demo from './Demo.vue'
</script>

# `AsyncButton`

> 自动处理异步操作的按钮。

传递一个异步 click 事件，在异步操作结束前，按钮会一直处于 loading 状态

click 事件必须是一个异步函数（使用 async 语法或者返回一个 Promise）。其余用法与 ant-design-vue 中的[button 组件](https://www.antdv.com/components/button-cn)保持一致

## 使用方式

<demo src="./Demo.vue" title="标题" desc="描述"></demo>

```vue
<template>
  <AsyncButton @click="handleClick">这是按钮</AsyncButton>
</template>

<script lang="ts" setup>
import { AsyncButton } from '@neuton/saas-ui';

const handleClick = async () => {
  const res = await api();
};
</script>
```
