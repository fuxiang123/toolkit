/**
 * 通过模板快速生成新项目
 * 命令：npm run create:pkg <目录名称> -- -p <项目名称> -t <项目模板>
 * 例: npm run create:pkg saas/test 在saas目录下创建test目录，项目名默认test
 * 例: npm run create:pkg saas/test -- -p vue-project -t vue 在saas目录下创建test目录，项目名为vue-project，模板为vue
 */
const createProject = require('./utils/createProject');
const resolveCommand = require('./utils/resolveCommand');
const install = require('./utils/install');

const { projectBaseName, projectName, dirName, dirPath, dirFullPath, templatePath } = resolveCommand();

if (!projectBaseName) {
  throw new Error('请输入项目名称');
}

if (!projectBaseName.match(/^[a-zA-Z]/)) {
  throw new Error('项目名称必须以字母开头');
}

// 模板点位，将模板里面{{ key }}替换为value中的值
const templatePoints = {
  dirName, // 项目所在文件夹名
  dirPath, // 项目相对路径
  projectBaseName, // 项目基本名称。例如：@fuxiang1234/my-project，my-project就是基本名称
  projectName, // 项目名
  gitrepo: 'https://gitee.com/fuxiang/fuxiang-toolkit',
  registry: 'http://82.157.120.5:4873/',
};

const init = async () => {
  await createProject(dirFullPath, templatePath, templatePoints);
  install(dirFullPath);
};

init();
