const fs = require('fs');
const path = require('path');
const templateFile = require('template-file');
const { Command } = require('commander');
const toCamelCase = require('./toCamelCase');

const program = new Command();

const root = process.cwd();
const target = path.resolve(root, 'packages');
const templatePath = path.resolve(root, 'template');

const dirName = program.parse().args[0];
const projectName = toCamelCase(dirName);

if (!projectName) {
  throw new Error('请输入项目名称');
}

if (!projectName.match(/^[a-zA-Z]/)) {
  throw new Error('项目名称必须以字母开头');
}

const data = {
  dirName,
  projectName,
};

const projectPath = path.resolve(target, data.dirName);
if (fs.existsSync(projectPath)) throw new Error('项目已存在');

fs.mkdirSync(projectPath);

fs.readdirSync(templatePath).forEach(file => {
  const filePath = path.resolve(templatePath, file);
  const targetPath = path.resolve(projectPath, file.replace('.tpl', ''));
  console.log('targetPath', targetPath);
  templateFile.renderFile(filePath, data).then(content => {
    fs.writeFileSync(targetPath, content);
  });
});
