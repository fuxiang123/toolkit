const fs = require('fs');
const path = require('path');
const templateFile = require('template-file');

module.exports = function (projectPath, templatePoints, templatePath) {
  if (fs.existsSync(projectPath)) throw new Error('项目已存在');

  fs.mkdirSync(projectPath);

  fs.readdirSync(templatePath).forEach(file => {
    // 处理tpl结尾的模板文件
    if (file.endsWith('.tpl')) {
      const filePath = path.resolve(templatePath, file);
      const targetPath = path.resolve(projectPath, file.replace('.tpl', ''));
      console.log('targetPath', targetPath);
      templateFile.renderFile(filePath, templatePoints).then(content => {
        fs.writeFileSync(targetPath, content);
      });
    } else {
      // 非模板文件直接复制
      const filePath = path.resolve(templatePath, file);
      const targetPath = path.resolve(projectPath, file);
      fs.copyFileSync(filePath, targetPath);
    }
  });
};
