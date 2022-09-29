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
if (isDev) plugins.push(terser());

// packages 文件夹路径
const root = path.resolve(__dirname, 'packages');

module.exports = fs
  .readdirSync(root)
  // 过滤，只保留文件夹
  .filter(item => fs.statSync(path.resolve(root, item)).isDirectory())
  // 为每一个文件夹创建对应的配置
  .map(item => {
    const pkgPath = path.resolve(root, item, 'package.json');
    if (!fs.existsSync(pkgPath)) return;
    const pkg = require(pkgPath);
    const input = path.resolve(root, item, 'index.ts');
    return {
      input,
      output: [
        {
          file: path.resolve(root, item, 'dist/index.js'),
          format: 'cjs',
          name: pkg.name,
        },
        {
          file: path.resolve(root, item, 'dist/index.esm.js'),
          format: 'es',
          name: pkg.name,
        },
      ],
      plugins,
    };
  })
  .filter(item => !!item);
