import { v4 as uuidv4 } from 'uuid';
import { getStorageGlobalSetting } from './storageSettings';
import { formatToday } from './utils/formatToday';

// 校验当前业务场景是否存在
const validateBussinessKey = (bussinessKey: string) => {
  const { scenes, defaultProjectKey } = getStorageGlobalSetting();
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
 * 生成文件的storage存储key
 * 生成规则：(项目标识)/<业务场景标识>/<用户userId>/<上传时间>/<唯一uuid>/ 文件名.文件后缀名
 * 示例：saas/doctor-profile/userId/2022-8-20/<唯一uuid>/ 文件名.文件后缀名
 * @param {String} bussinessKey 当前业务场景标识
 * @param {String} userId 当前用户id
 */
export const generateFileKey = (bussinessKey: string, fileName: string) => {
  const isExist = validateBussinessKey(bussinessKey);
  if (!isExist) {
    throw new Error('当前业务场景标识不存在，请先进行注册');
  }

  const { defaultProjectKey, formatFileKey } = getStorageGlobalSetting();
  let projectKey = defaultProjectKey!;
  let scene = bussinessKey;
  // 处理传递了项目标识(如:saas-project/saas-scene)的情况
  if (bussinessKey.indexOf('/') !== -1) {
    const [p, s] = bussinessKey.split('/');
    projectKey = p;
    scene = s;
  }
  if (formatFileKey) {
    return formatFileKey({
      project: projectKey,
      scene,
      fileName,
    });
  }
  // 日期格式化 YYYY-MM-DD,
  const dateStr = formatToday();

  const uuid = uuidv4();
  return `${projectKey}/${scene}/${dateStr}/${uuid}/${fileName}`;
};
