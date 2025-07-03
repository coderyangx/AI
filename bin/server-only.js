// 只构建服务器部分
console.log('准备构建服务器...');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 进入服务器目录
  process.chdir(path.join(__dirname, 'packages/server'));

  // 安装依赖
  console.log('安装服务器依赖...');
  execSync('yarn install', { stdio: 'inherit' });

  // 构建服务器
  console.log('构建服务器...');
  execSync('yarn build', { stdio: 'inherit' });

  // 创建输出目录
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 复制构建结果
  console.log('复制构建结果...');
  const serverDistDir = path.join(__dirname, 'packages/server/dist');
  const files = fs.readdirSync(serverDistDir);

  files.forEach((file) => {
    const srcPath = path.join(serverDistDir, file);
    const destPath = path.join(distDir, file);

    if (fs.statSync(srcPath).isDirectory()) {
      // 递归复制目录
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
    }
  });

  console.log('服务器构建完成!');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
}
