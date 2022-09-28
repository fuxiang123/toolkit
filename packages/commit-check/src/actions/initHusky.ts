import fs from 'fs';
import path from 'path';
import { getPackageJson, rootPath } from '../utils.js';

const getHuskyCommand = (hookName: string, command: string) => {
  return `npx husky add .husky/${hookName} "${command}"`;
};

const commitMsgCommand = 'npx --no-install commitlint --edit $1';
const preCommitCommand = 'npx lint-staged';
const postinstall = `${getHuskyCommand('commit-msg', commitMsgCommand)} && ${getHuskyCommand('pre-commit', preCommitCommand)}`;

export const initHusky = async () => {
  const pkgJson = getPackageJson();
  pkgJson.scripts['prepare'] = 'npx husky install';
  pkgJson.scripts['postinstall'] = postinstall;
  fs.writeFileSync(path.resolve(rootPath, 'package.json'), JSON.stringify(pkgJson, null, 2));
};
