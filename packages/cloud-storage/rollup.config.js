/* eslint-disable  */
import fs from 'fs';
import path from 'path';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';

// 公共插件配置
const plugins = [del({ targets: 'dist/*' }), json(), nodeResolve(), typescript(), commonjs(), terser()];

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
  external: ['@neuton/requests'],
};
