import { v4 as uuidv4 } from 'uuid';
import { getStorageGlobalSetting, StorageGlobalSetting } from '../storageSettings';
import { formatToday } from './formatToday';

// 默认的文件key生成规则
const getDefaultFileKey = (projectKey: string, filename: string) => {
  // 日期格式化 YYYY-MM-DD,
  const dateStr = formatToday();
  const uuid = uuidv4();
  // 测试服和正式服存储不同的根文件路径
  const rootDir = getStorageGlobalSetting().env === 'test' ? 'saas-test' : 'saas-prod';
  return `${rootDir}/${projectKey}/${dateStr}/${uuid}/${filename}`;
};

/**
 * 生成文件的storage存储key
 * @param fileName 文件名
 * @param customFileKey 自定义文件key生成规则,覆盖全局设置
 */
export const generateFileKey = (filename: string, customFileKey?: StorageGlobalSetting['formatFileKey']) => {
  if (!filename) {
    throw new Error('请传入文件名');
  }

  const { projectKey, formatFileKey } = getStorageGlobalSetting();

  if (!projectKey) {
    throw new Error('请为cloud-storage配置projectKey参数');
  }

  // 优先使用自定义的文件key生成规则，其次使用全局的生成规则，最后使用默认的生成规则
  if (customFileKey) {
    return customFileKey(projectKey, filename);
  }
  if (formatFileKey) {
    return formatFileKey(projectKey, filename);
  }
  return getDefaultFileKey(projectKey, filename);
};
