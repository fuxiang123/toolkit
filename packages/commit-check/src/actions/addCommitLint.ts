import fs from 'fs';
import path from 'path';
import { rootPath, writeInPkg, getPackageJson } from '../utils';
import { commitLintConfig } from '../commitLintConfig';

const devDependencies = [
  '@commitlint/cli@^17.0.3',
  '@commitlint/config-angular@^17.0.3',
  'commitizen@^4.2.4',
  'cz-customizable@^6.9.0',
  '@commitlint/cz-commitlint@^17.0.3',
  'inquirer@^8.0.0',
  'husky@^8.0.0',
  'lint-staged@^12.4.1',
];

/**
 * 添加commitlint相关配置
 */
export const addCommitLint = () => {
  const commitlintPath = path.resolve(rootPath, 'commitlint.config.js');
  writeInPkg(devDependencies);
  const pkgJson = getPackageJson();
  pkgJson['config'] = {
    commitizen: {
      path: '@commitlint/cz-commitlint',
    },
  };
  pkgJson.scripts['commit'] = 'npx git-cz';
  pkgJson['lint-staged'] = {
    '*.{js,ts,vue,jsx,tsx}': ['npx eslint --ignore-path .gitignore --fix'],
    '*.{js,jsx,ts,tsx,md,html,css,lees,scss,sass}': 'npx prettier --write',
  };
  if (fs.existsSync(commitlintPath)) {
    fs.unlinkSync(commitlintPath);
  }
  fs.writeFileSync(path.resolve(rootPath, 'package.json'), JSON.stringify(pkgJson, null, 2));
  fs.writeFileSync(commitlintPath, commitLintConfig);
};
