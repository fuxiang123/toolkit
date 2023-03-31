/* eslint-disable @typescript-eslint/no-empty-function */
import { userInfoKey, pathKey, tokenKey } from './constants';

// storage工厂函数。用storage保存数据，方便在不同应用之间共享
function createStorageFactory(key: string, type: 'sessionStorage' | 'localStorage') {
  if (typeof window === 'undefined') return { get: () => '', set: () => {}, remove: () => {} };

  const storage = window[type];
  return {
    get: () => storage.getItem(key),
    set: (value: string) => storage.setItem(key, value),
    remove: () => storage.removeItem(key),
  };
}

// 兼容ssr写法，防止window不存在
export const getUserStorage = () => createStorageFactory(userInfoKey, 'localStorage');
export const getPathStorage = () => createStorageFactory(pathKey, 'sessionStorage');
export const getTokenStorage = () => createStorageFactory(tokenKey, 'sessionStorage');
