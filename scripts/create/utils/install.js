const child_process = require('child_process');

// 进入对应目录，执行pnpm i
module.exports = async targetPath => {
  const cwd = process.cwd();
  const command = `cd ${targetPath} && pnpm i && cd ${cwd}`;
  // 子线程执行指令
  child_process.execSync(command, { stdio: 'inherit' });
};
