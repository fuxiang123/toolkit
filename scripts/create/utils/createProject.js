const fs = require('fs');
const path = require('path');
const templateFile = require('template-file');

module.exports = async (projectPath, templatePath, templatePoints) => {
  if (fs.existsSync(projectPath)) throw new Error('项目已存在');

  fs.mkdirSync(projectPath, { recursive: true });

  const filePaths = fs.readdirSync(templatePath);

  for (let i = 0; i < filePaths.length; i++) {
    const file = filePaths[i];
    // 处理tpl结尾的模板文件
    if (file.endsWith('.tpl')) {
      const filePath = path.resolve(templatePath, file);
      const targetPath = path.resolve(projectPath, file.replace('.tpl', ''));
      const content = await templateFile.renderFile(filePath, templatePoints);
      fs.writeFileSync(targetPath, content);
    } else {
      // 非模板文件直接复制
      const filePath = path.resolve(templatePath, file);
      const targetPath = path.resolve(projectPath, file);
      fs.copyFileSync(filePath, targetPath);
    }
  }
};
