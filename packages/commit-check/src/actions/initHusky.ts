import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getPackageJson, rootPath } from '../utils.js';

export const initHusky = async () => {
  const pkgJson = getPackageJson();
  pkgJson.scripts['prepare'] = 'npx husky install';
  fs.writeFileSync(path.resolve(rootPath, 'package.json'), JSON.stringify(pkgJson, null, 2));

  execSync('npm run prepare');
  execSync('npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"');
  execSync('npx husky add .husky/pre-commit "npx lint-staged"');
};
