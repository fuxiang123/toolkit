# `neuton-toolkit`

> 凝动 monorepo 工具库

## 预先准备

安装 pnpm

```
npm install -g pnpm
```

## 使用方式

### 安装依赖

```
pnpm install
```

### 构建项目

```
pnpm build
```

### 创建新项目

```
// pnpm create:pkg <项目名>
pnpm create:pkg test-demo
```

### 发布项目

> 注：如有不需要发布到 npm 的项目，需要在 package.json 里面添加 `private:true` 属性

```
pnpm publish:pkg
// or
npx lerna publish
```
