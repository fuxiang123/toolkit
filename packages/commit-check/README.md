# `@fuxiang1234/commit-check`

> 一键添加 git commit 校验工具。强制 commit 信息遵循 angular 规范。

## 安装方式

### 1.在项目根目录下安装依赖

```
npm install @fuxiang1234/commit-check -D
```

### 2. 运行 commit-check 指令

```
npx commit-check
```

### 3. 运行完毕后，执行 install 指令

```
npm install
```

## 使用方式

可用两种方式提交代码

1. 命令行提交
   使用` npm run commit`可打开交互式界面，按照引导输入即可

2. git commit 提交
   直接使用 git commit 提交也可规则触发校验，但提交信息必须遵循 commit 规范

## 注意

commit-check 利用 husky 添加 git hooks，会覆盖掉原本的 husky 配置文件，请注意保存
