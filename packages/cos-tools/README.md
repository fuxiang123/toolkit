# `@neuton/cos-tools`

> cos 上传工具库。可对 cos 存储桶上的资源进行上传、下载、获取链接等操作。

### 安装

```
npm i cos-js-sdk-v5 @neuton/requests @neuton/cos-tools
```

### 初始化

**因 cos-tools 会在多个项目中使用，为防止文件命名冲突，需要在项目入口处（如 main.js）调用 setCosGlobalSetting 函数，注册项目中会使用到的项目标识和业务标识。**

项目标识和业务标识可以是自定义的任意字符串，但为了方便维护，需要注意两点

1. 不要和别人的重复
2. 取名时候要体现出当前业务场景

**如果添加了新的标识，需要写到这个文档里面（[点击查看](https://onm4v0chdx.feishu.cn/docx/GxPAdzWTkoiZj1xhlt9cHSHknrh)），方便其他人查看。**

cos-tools 会对项目标识、业务标识和文件名等信息进行拼接，生成唯一的文件路径。如果需要自定义文件路径，可以配置 formatFileKey 选项

```typescript
import { setCosGlobalSetting } from '@/lib/useCosStorage';

// 设置cos全局设置
setCosGlobalSetting({
  // 场景标识。传入与当前项目关联的字符串
  env: 'prod' | 'test', // 生产环境传入'prod', 测试环境传入'test',
  // 配置当前项目用到的业务场景标识
  scenes: {
    project: string; // 项目标识。用来标识资源所属的项目
    scenes: string[]; // 场景标识。用来标识资源所属的业务场景
  }[];
  // 默认项目标识,可选。不传默认为scenes数组中第一个项目标识
  defaultProjectKey?: string;
  // 自定义文件路径生成规则
  formatFileKey?: (params: { project: string; scene: string; fileName: string }) => string;
  // 设置token，如果使用@neuton/requests作为请求库则不需要设置
  handleToken?: () => string;
});
```

### 上传文件

使用示例

```javascript
import { uploadFile } from '@neuton/cos-handler';

const fileKey = uploadFile('scene1', file); // 使用默认项目id下的场景
const fileKey = uploadFile('project2/scene1', file); // 使用其他项目id下的场景

// 将返回的fileKey传给后端
```

参数说明

```typescript
/**
 * 上传文件到cos
 * @param file 上传的文件
 * @param bussinessKey 业务场景标识, 例如:doctor-profile 或 saas/doctor-profile
 * @param uploadConfig.maxFileSize 限制本次上传的文件大小， 单位为字节
 * @param uploadConfig.fileName 为本次上传的文件重新命名
 * @return {Promise<String | undefined>} 返回上传成功的文件key。失败返回undefined
 */
const uploadFile: (bussinessKey: string, file: File, uploadConfig?: UploadFileConfig) => Promise<string | undefined>;
```

### 下载文件

使用示例

```javascript
import { downloadFile } from '@neuton/cos-handler';

downloadFile(filekey); // 使用默认项目id下的场景
downloadFile(filekey); // 使用其他项目id下的场景
```

参数说明

```typescript
export declare const downloadFile: (fileKey: string) => Promise<void>;
```

### 获取文件链接

```javascript
import { getDownloadUrl } from '@neuton/cos-handler';

getDownloadUrl(filekey); // 使用默认项目id下的场景
getDownloadUrl(filekey); // 使用其他项目id下的场景
```

参数说明

```typescript
export declare const downloadFile: (fileKey: string) => Promise<void>;
```

### 删除

删除功能不直接通过前端进行。将文件 key 传递给后端删除接口，再由后端访问 cos 进行删除。
