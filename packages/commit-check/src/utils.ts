import fs from 'fs';
import path from 'path';

export const rootPath = process.cwd() as string;

/** 根目录文件是否存在 */
export const fileExisist = (filePath: string) => {
  return fs.existsSync(path.resolve(rootPath, filePath));
};

/**
 * 把package.json转化为json
 */
export const getPackageJson = () => {
  // if (!(await pathExists('package.json'))) process.exit(0);
  const file = path.resolve(rootPath, 'package.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return json;
};

/**
 * 在package.json里面写入内容
 */
export const writeInPkg = (devArr: string[], key = 'devDependencies') => {
  const pkg = getPackageJson();
  devArr.forEach(item => {
    // 为了防止安装包里面的名字有@
    const index = item.lastIndexOf('@');
    const k = index === -1 ? item : item.slice(0, index);
    const v = index === -1 ? '' : item.slice(index + 1) || '';
    pkg[key][k] = v;
  });
  fs.writeFileSync(path.resolve(rootPath, 'package.json'), JSON.stringify(pkg, null, 2));
};
