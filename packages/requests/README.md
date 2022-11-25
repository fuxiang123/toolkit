# `@neuton/requests`

> 凝动前端基础请求库, 基于 axios 封装。

## 初始化配置

在项目入口处（如 main.js）调用 setRequestConfig， 进行全局基础配置

```javascript
import { setRequestConfig } from '@neuton/requests';
setRequestConfig({
  baseURL: 'xxx', // 配置基础请求url前缀
  handleToken: () => 'token', // 获取token的回调函数，需要一个返回字符串的函数
});
```

完整配置项

```typescript
interface RequestsConfig {
  // 基础url前缀
  baseURL?: string;
  // 后端接口表示请求成功时候的权限码，默认00000
  successAuthCode?: string[];
  // 传递一个获取token的函数
  handleToken?: () => string;
  // 请求头处理
  handleRequestHeader?: (headers: AxiosRequestConfig['headers']) => AxiosRequestConfig['headers'];
  // http状态码非200情况处理
  handleNetworkError?: (httpStatus: number | undefined) => void;
  // 后端接口状态码（response.code）与successAuthCode不同时候的情况处理
  handleAuthError?: (data: AxiosResponse['data']) => void;
}
```

## 使用方式

绝大多数情况下，直接引入接口对应的 http 函数即可。

```javascript
import { get, post, put, del } from '@neuton/requests';

const getApi = params => get('接口路径', params);
const postApi = params => get('接口路径', params);
```

为了使用方便和标准化，直接提供的 http 函数都只能处理标准化接口（即接口符合 restful 规范，并且返回的数据中，根路径包含 code、data 和 msg 字段），并直接返回 data 字段中的数据。

如果遇到非标准化的接口，可以使用 request 函数进行处理。

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

同时还针对下载场景提供了 download 函数。

```javascript
download(url, params, {
  filename: `文件名`,
  method: 'get',
});
```

## 多业务场景处理

某些项目可能有多个业务场景，后端也提供了多套不同的 api，这时候可以使用 create 函数创建一个新的 requests 实例。

不同 requests 实例的配置彼此独立，不会共享。

```javascript
import { create } from '@neuton/requests';

const { request, get, post, put, del, download } = create({
  // 传入配置
  baseURL: 'xxx',
});
```
