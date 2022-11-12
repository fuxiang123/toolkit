# `useDebounceFn`

> 对函数进行防抖处理。在限定毫秒数内，多次调用函数只会触发一次函数调用。

默认为限定 500 毫秒内调用一次。

## 使用方式

```html
<template>
  <button @click="run">这是按钮</button>
</template>

<script lang="ts">
  import { useDebounceFn } from '@neuton/saas-toolkit';

  // 原始函数
  const fn = () => {};
  // 防抖处理后的函数
  const { run } = useDebounceFn(fn);
</script>
```

## API

```typescript
const {
  run,
  cancel,
  flush
} = useDebounceFn(
  fn: (...args: any[]) => any,
  options?: Options
);
```

### Params

| 参数    | 说明               | 类型                      | 默认值 |
| ------- | ------------------ | ------------------------- | ------ |
| fn      | 需要防抖执行的函数 | `(...args: any[]) => any` | -      |
| options | 配置防抖的行为     | `Options`                 | -      |

### Options

| 参数     | 说明                     | 类型      | 默认值  |
| -------- | ------------------------ | --------- | ------- |
| wait     | 等待时间，单位为毫秒     | `number`  | `500`   |
| leading  | 是否在延迟开始前调用函数 | `boolean` | `false` |
| trailing | 是否在延迟开始后调用函数 | `boolean` | `true`  |
| maxWait  | 最大等待时间，单位为毫秒 | `number`  | -       |

### Result

| 参数   | 说明                               | 类型                      |
| ------ | ---------------------------------- | ------------------------- |
| run    | 触发执行 fn，函数参数将会传递给 fn | `(...args: any[]) => any` |
| cancel | 取消当前防抖                       | `() => void`              |
| flush  | 立即调用当前防抖函数               | `() => void`              |
