/* eslint-disable  */
import fs from 'fs';
import path from 'path';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import image from '@rollup/plugin-image';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';

const isDev = process.env.NODE_ENV !== 'production';

const extensions = ['.ts', '.tsx', '.vue'];

// 公共插件配置
const plugins = [
  vue({
    target: 'browser',
  }),
  postcss(),
  json(),
  nodeResolve(),
  typescript(),
  commonjs(),
  image(),
  babel({
    babelHelpers: 'bundled',
    extensions,
    presets: ['@babel/preset-typescript', '@vue/babel-preset-jsx'],
  }), // babelHelpers是bable的最佳实践方案 extensions编译的扩展文件
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
  external: ['vue', 'ant-design-vue'],
};
