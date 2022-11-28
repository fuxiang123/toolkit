import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { cosStorage } from './cosStorage';
import { getCosGlobalSetting } from './cosSettings';
import { transByte } from './utils/transByte';
import { getDownloadUrl as getDownloadUrlApi } from './api';
import { downLoadFile } from './utils/downloadFIle';
/** 单次上传的配置 */
interface UploadFileConfig {
  maxFileSize?: number; // 限制本次上传的文件大小， 单位为字节
  fileName?: string; // 为本次上传的文件重新命名
}

// 校验当前业务场景是否存在
const validateBussinessKey = (bussinessKey: string) => {
  const { scenes, defaultProjectKey } = getCosGlobalSetting();
  // 处理传递了项目标识的情况
  if (bussinessKey.indexOf('/') > -1) {
    const [projectKey, scene] = bussinessKey.split('/');
    return !!scenes.find(item => item.project === projectKey)?.scenes?.includes(scene);
  } else {
    // 处理未传递项目标识的情况
    const scene = bussinessKey;
    return !!scenes.find(item => item.project === defaultProjectKey)?.scenes?.includes(scene);
  }
};

/**
 * 生成文件的cos存储key
 * 生成规则：(项目标识-test | 项目标识-prod)/<业务场景标识>/<用户userId>/<上传时间>/<唯一uuid>/ 文件名.文件后缀名
 * 示例：saas-test/doctor-profile/userId/2022-8-20/<唯一uuid>/ 文件名.文件后缀名
 * @param {String} bussinessKey 当前业务场景标识
 * @param {String} userId 当前用户id
 */
export const generateFileKey = (bussinessKey: string, fileName: string) => {
  const isExist = validateBussinessKey(bussinessKey);
  if (!isExist) {
    throw new Error('当前业务场景标识不存在，请先进行注册');
  }

  const { env, defaultProjectKey, formatFileKey } = getCosGlobalSetting();
  let projectKey = defaultProjectKey;
  let scene = bussinessKey;
  if (bussinessKey.indexOf('/') !== -1) {
    const [p, s] = bussinessKey.split('/');
    projectKey = p;
    scene = s;
  }
  const projectKeyWithEnv = `${projectKey}-${env}`;
  if (formatFileKey) {
    return formatFileKey({
      project: projectKeyWithEnv,
      scene,
      fileName,
    });
  }

  const date = dayjs().format('YYYY-MM-DD');
  const uuid = uuidv4();
  return `${projectKeyWithEnv}/${scene}/${date}/${uuid}/${fileName}`;
};

/**
 * 上传文件到cos
 * @param file 上传的文件
 * @param bussinessKey 业务场景标识, 例如:doctor-profile 或 saas/doctor-profile
 * @param uploadConfig.maxFileSize 限制本次上传的文件大小， 单位为字节
 * @param uploadConfig.fileName 为本次上传的文件重新命名
 * @return {Promise<String | undefined>} 返回上传成功的文件key。失败返回undefined
 */
export const uploadFile = async (bussinessKey: string, file: File, uploadConfig?: UploadFileConfig) => {
  if (!bussinessKey) {
    throw new Error('请先设置config.bussinessKey');
  }
  // 判断文件大小是否超过限制
  const fileSize = uploadConfig?.maxFileSize;
  if (file.size && fileSize) {
    if (file.size > fileSize) {
      const sizeStr = transByte(file.size);
      throw new Error(`文件大小不能超过${sizeStr}`);
    }
  }

  const fileName = uploadConfig?.fileName ?? file.name;
  const fileKey = generateFileKey(bussinessKey, fileName);
  const uploadRes = await cosStorage.uploadFile(file as File, fileKey);
  if (uploadRes) {
    return fileKey;
  }
  return undefined;
};

export const getDownloadUrl = async (fileKey: string) => {
  const res = await getDownloadUrlApi(fileKey);
  if (typeof res?.data === 'string') {
    return res.data;
  }
  return undefined;
};

/**
 *
 * @param fileKey 要下载的文件的fileKey，通过后端接口获取
 */
export const downloadFile = async (fileKey: string) => {
  const url = await getDownloadUrl(fileKey);
  if (url) {
    const res = await cosStorage.download(fileKey);
    if (res) {
      const filename = fileKey.split('/').pop();
      downLoadFile(filename ?? '下载文件', res);
    }
  }
};
