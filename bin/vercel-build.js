// Vercel 构建脚本 - 只构建服务器部分
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('当前工作目录:', process.cwd());
console.log('文件列表:', fs.readdirSync('.'));

try {
  // 检查是否在 Vercel 环境中
  const isVercel = process.env.VERCEL === '1';
  console.log('是否在 Vercel 环境中:', isVercel);

  // 确定服务器目录路径
  const serverDir = path.join(process.cwd(), 'packages', 'server');
  console.log('服务器目录:', serverDir);

  // 检查服务器目录是否存在
  if (!fs.existsSync(serverDir)) {
    console.log('目录列表:', fs.readdirSync(process.cwd()));
    if (fs.existsSync('packages')) {
      console.log(
        'packages 目录内容:',
        fs.readdirSync(path.join(process.cwd(), 'packages'))
      );
    }
    throw new Error(`服务器目录不存在: ${serverDir}`);
  }

  // 进入服务器目录
  process.chdir(serverDir);
  console.log('切换到服务器目录:', process.cwd());

  // 安装依赖
  console.log('安装服务器依赖...');
  execSync('yarn install', { stdio: 'inherit' });

  // 构建服务器
  console.log('构建服务器...');
  execSync('yarn build', { stdio: 'inherit' });

  // 创建输出目录
  const rootDir = path.join(process.cwd(), '..', '..');
  const distDir = path.join(rootDir, 'dist');

  console.log('创建输出目录:', distDir);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 复制构建结果
  console.log('复制构建结果...');
  const serverDistDir = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(serverDistDir)) {
    throw new Error(`服务器构建输出目录不存在: ${serverDistDir}`);
  }

  const files = fs.readdirSync(serverDistDir);
  console.log('服务器构建文件:', files);

  files.forEach((file) => {
    const srcPath = path.join(serverDistDir, file);
    const destPath = path.join(distDir, file);

    try {
      if (fs.statSync(srcPath).isDirectory()) {
        // 递归复制目录
        fs.cpSync(srcPath, destPath, { recursive: true, force: true });
      } else {
        // 复制文件
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`已复制: ${file}`);
    } catch (err) {
      console.error(`复制 ${file} 失败:`, err);
    }
  });

  console.log('服务器构建完成!');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
}
