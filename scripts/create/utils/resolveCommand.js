const path = require('path');
const { Command } = require('commander');
const toCamelCase = require('./toCamelCase');

// 模板文件路径
const templatePaths = {
  base: path.resolve(process.cwd(), './template/base'),
  vue: path.resolve(process.cwd(), './template/vue'),
};

module.exports = function () {
  const program = new Command()
    .option('-p, --projectName [name]', '项目名称: 如 -p @neutpn/my-project')
    .option('-t, --template [vue | default]', '模板名称: 如 -d vue')
    .parse();

  const opts = program.parse().opts();
  const dirPath = program.args[0];
  const dirPathArr = dirPath.split('/');
  // 默认项目名
  const projectBaseName = dirPathArr[dirPathArr.length - 1];

  // 项目根路径
  const target = path.resolve(process.cwd(), 'packages');

  return {
    // 项目基本名称。例如：@neuton/my-project，my-project就是基本名称
    projectBaseName,
    // 项目名
    projectName: opts.projectName ?? toCamelCase(projectBaseName),
    // 项目文件夹名
    dirName: dirPathArr[dirPathArr.length - 1],
    // 项目相对路径
    dirPath: 'packages/' + dirPath,
    // 项目完整路径
    dirFullPath: path.resolve(target, dirPath),
    // 模板文件路径
    templatePath: opts.template === 'vue' ? templatePaths.vue : templatePaths.base,
  };
};
