/* eslint-disable  */
import fs from 'fs';
import path from 'path';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import shebang from 'rollup-plugin-preserve-shebang';

const isDev = process.env.NODE_ENV !== 'production';

// 公共插件配置
const plugins = [
  json(),
  nodeResolve(),
  postcss({
    // 把 css 插入到 style 中
    // inject: true,
    // 把 css 放到和js同一目录
    extract: true,
  }),
  babel({ babelHelpers: 'bundled' }),
  typescript(),
  shebang(),
];

// 如果不是开发环境，开启压缩
if (!isDev) plugins.push(terser());

// packages 文件夹路径
const root = __dirname;

const pkgPath = path.resolve(root, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('找不到package.json文件');
const pkg = require(pkgPath);
const input = path.resolve(root, 'index.ts');

module.exports = {
  input,
  output: [
    {
      file: path.resolve(root, 'dist/index.js'),
      format: 'cjs',
      name: pkg.name,
    },
    {
      file: path.resolve(root, 'dist/index.esm.js'),
      format: 'es',
      name: pkg.name,
    },
  ],
  plugins,
};
