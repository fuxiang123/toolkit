# `@neuton/cloud-storage`

> 凝动通用云存储工具库。可对文件进行上传、下载、获取链接等操作。

### 安装

```
npm i @aws-sdk/client-s3 @neuton/requests @neuton/cloud-storage
```

### 初始化

**为了区分不同项目，需要在项目入口处（如 main.js）调用 setStorageGlobalSetting 函数，配置当前项目的字符串 key。**

项目 key 可以是自定义的任意字符串，但为了避免重复，建议用当前项目名作为 key。

cloud-storage 也会对项目 key 和文件名等信息进行拼接，生成唯一的文件路径。如果需要自定义文件路径，可以配置 formatFileKey 选项。

```typescript
import { setStorageGlobalSetting } from '@neuton/cloud-storage';

// 配置示例
setStorageGlobalSetting({
  env: process.env.VUE_APP_Enviroment === 'prod' ? 'prod' : 'test',
  projectKey: 'saas-project',
  handleToken: () => localStorage.getItem('Authorization') ?? '',
});

// 完整配置项
setStorageGlobalSetting({
  // 场景标识。传入与当前项目关联的字符串
  env: 'prod' | 'test', // 生产环境传入'prod', 测试环境传入'test',
  // 配置代表当前项目字符串key
  projectKey: string;
  // 设置上传时的token，如果项目中使用@neuton/requests作为请求库，并且已配置过token则不需要重复配置
  handleToken?: () => string;
  // 自定义上传文件key生成规则
  formatFileKey?: (projectKey: string, filename: string) => string;
});
```

### 上传文件

使用示例

```javascript
import { uploadFile } from '@neuton/cloud-storage';

const fileKey = uploadFile(file);
```

参数说明

```typescript
/** 单次上传的配置 */
export interface UploadFileConfig {
  maxFileSize?: number; // 限制本次上传的文件大小， 单位为字节
  fileName?: string; // 为本次上传的文件重新命名
  onUploadProgress?: (e: AxiosProgressEvent) => void; // 上传进度回调，同axios的onUploadProgress
  cancelTokenCallback?: (cancel: () => void) => void; // 取消上传回调，通过调用cancel()取消上传
  // 自定义本次上传中，文件key的生成规则, 会覆盖全局的生成规则
  formatFileKey: (projectKey: string, fileName: string) => string;
}

const uploadFile: (file: File, uploadConfig?: UploadFileConfig) => Promise<string | undefined>;
```

### 分块上传

```javascript
// 获取上传进度
const onProgress = (e: any) => {
  console.log('onProgress', e);
};

// 准备分块上传
const multiUpload = await createMultipartUpload(file, {
  onUploadProgress: onProgress,
  partSize: 1024 * 1024,
});
if (multiUpload) {
  const { start, pause, resume } = multiUpload;
  // 开始上传
  start();
  // 暂停上传
  // pause();
  // 恢复上传
  // resume();
}
```

参数说明

```typescript
interface MultipartUploadConfig {
  storageType?: 'minio' | 'cos'; // 存储类型, 默认cos
  fileName?: string; // 重命名文件名
  partSize?: number; // 分块大小，默认5M
  onUploadProgress?: (e: { total: number; progress: number; loaded: number }) => void; // 上传进度回调，同axios的onUploadProgress
  formatFileKey?: (projectKey: string, fileName: string) => string; // 自定义文件key生成规则
}

export declare const createMultipartUpload: (
  file: File,
  config?: MultipartUploadConfig | undefined,
) => Promise<
  | {
      start: () => Promise<void>;
      pause: () => void;
      resume: () => void;
    }
  | undefined
>;
```

### 下载文件

使用示例

```javascript
import { downloadFile } from '@neuton/cloud-storage';

downloadFile(filekey);
```

参数说明

```typescript
interface DownloadFileConfig {
  fileName?: string; // 为本次下载的文件重新命名
  onDownloadProgress?: (e: AxiosProgressEvent) => void; // 下载进度回调，同axios的onDownloadProgress
  cancelTokenCallback?: (cancel: () => void) => void; // 取消上传回调，通过调用cancel()取消上传
}

export declare const downloadFile: (fileKey: string, downloadConfig: DownloadFileConfig) => Promise<void>;
```

### 获取文件链接

```javascript
import { getFileUrl } from '@neuton/cloud-storage';

getFileUrl(filekey);
```

参数说明

```typescript
export declare const getFileUrl: (fileKey: string) => Promise<string>;
```

### 删除

为安全起见，删除功能不直接通过前端进行。可将文件 key 传递给项目对应后端开发，由后端自行进行相关操作。
