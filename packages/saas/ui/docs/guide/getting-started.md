# 快速开始

## 安装

### 添加私有 npm

1. 在项目根目录下创建.npmrc 文件。
2. 在.npmrc 文件中写入如下内容:

```
registry=http://82.157.120.5:4873/
```

### 安装@neuton/saas-toolkit

```
# 使用yarn
yarn add @neuton/saas-toolkit
# 使用npm
npm i @neuton/saas-toolkit
# 使用pnpm
pnpm i @neuton/saas-toolkit
```

推荐使用[ni](https://github.com/antfu/ni#ni)安装依赖。

```
# 使用ni
ni @neuton/saas-toolkit
```