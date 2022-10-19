import { userInfoKey, pathKey, tokenKey } from './constants';

// storage工厂函数。用storage保存数据，方便在不同应用之间共享
function createStorageFactory(key: string, type: 'sessionStorage' | 'localStorage') {
  const storage = window[type];
  return {
    get: () => storage.getItem(key),
    set: (value: string) => storage.setItem(key, value),
    remove: () => storage.removeItem(key),
  };
}

export const userStorage = createStorageFactory(userInfoKey, 'localStorage');
export const pathStorage = createStorageFactory(pathKey, 'sessionStorage');
export const tokenStorage = createStorageFactory(tokenKey, 'sessionStorage');
