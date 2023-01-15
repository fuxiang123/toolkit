# `@neuton/requests`

> 凝动前端基础请求库, 基于 axios 封装。

## 安装

```
# npm
npm install @neuton/requests
# yarn
yarn add @neuton/requests
# pnpm
pnpm install @neuton/requests

```

## 初始化配置

在项目入口处（如 main.js）调用 setRequestConfig， 进行全局基础配置

```javascript
import { setRequestConfig } from '@neuton/requests';
setRequestConfig({
  baseURL: 'xxx', // 配置基础请求url前缀
  handleToken: () => 'token', // 获取token的回调函数，需要一个返回字符串的函数
  successAuthCode: ['00000'], // 接口权限码。如果接口不包含该权限码会抛出错误
});
```

完整配置项

```typescript
interface RequestsConfig {
  // 基础url前缀
  baseURL?: string;
  // 后端接口表示请求成功时候的权限码，如果接口没有返回对应权限码则表示请求出错
  successAuthCode?: string[];
  // 传递一个获取token的函数
  handleToken?: () => string;
  // http状态码非200情况处理
  handleNetworkError?: (httpStatus: number | undefined) => void;
  // 后端接口状态码（response.code）与successAuthCode不同时候的情况处理
  handleAuthError?: (data: AxiosResponse['data']) => void;
  // 通用request处理
  handleRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  // 通用response处理
  handleResponse?: (response: AxiosResponse) => AxiosResponse;
}
```

## 使用方式

绝大多数情况下，直接引入接口对应的 http 函数即可。

```javascript
import { get, post, put, del } from '@neuton/requests';

const getApi = params => get('接口路径', params);
const postApi = params => post('接口路径', params);
```

推荐搭配 [vue-hooks-plus](https://inhiblab-core.gitee.io/docs/hooks/guide/) 中的 [useRequest](https://inhiblab-core.gitee.io/docs/hooks/useRequest/) 使用，简化相关代码。

```javascript
import { useRequest } from 'vue-hooks-plus';
const getUsername = params => get('/接口路径', params);

const { data, error, loading } = useRequest(() => getUsername({ desc: 'good' }));
```

为了使用方便和标准化，直接提供的 get/post 等函数都只能处理标准化接口（即接口符合 restful 规范，并且返回的数据中，根路径包含 code、data 和 msg 字段），且会直接返回 data 字段中的数据。

如果遇到非标准化的接口(如接口返回的根路径中不包含 data 字段)，可以使用 request 函数进行处理。

```javascript
import { request } from '@neuton/requests';

const getApi = params =>
  request({
    url: 'https://www.baidu.com',
    method: 'get',
    headers: {
      ...
    }
  })
```

## 多业务场景处理

某些项目可能有多个业务场景，后端也提供了多套不同的 api，这时候可以使用 create 函数创建一个新的 requests 实例。

不同 requests 实例的配置彼此独立，不会共享。

```javascript
import { create } from '@neuton/requests';

const { request, get, post, put, del } = create({
  // 传入配置
  baseURL: 'xxx',
});
```

## 获取 axios 实例

在某些复杂场景，如果@neuton/request 的默认配置不能满足您的要求，您可以通过`requests.instance`获取 axios 示例，来自定义如拦截器等功能。

```javascript
import { requests } from '@neuton/requests';

requests.instance.interceptors.request.use(config => {
  console.log('config', config);
  return config;
});
```

## 获取原本的 axios（不推荐）

如果确实存在本工具库无法覆盖的场景（如获取 CancelToken 等），你也可以通过以下方式获取原本的 axios。

```javascript
import { axios } from '@neuton/requests';
```
