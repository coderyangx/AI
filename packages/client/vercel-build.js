const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('开始 Vercel 客户端构建...');

// 确保组件目录存在
const componentsDir = path.join(
  __dirname,
  'dist',
  'src',
  'components',
  'shadcn'
);
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// 复制组件文件
const sourceComponentsDir = path.join(__dirname, 'src', 'components', 'shadcn');
if (fs.existsSync(sourceComponentsDir)) {
  const files = fs.readdirSync(sourceComponentsDir);
  files.forEach((file) => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const sourcePath = path.join(sourceComponentsDir, file);
      const destPath = path.join(componentsDir, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`已复制: ${file}`);
    }
  });
}

// 执行常规构建
try {
  console.log('执行 Vite 构建...');
  execSync('yarn build', { stdio: 'inherit' });
  console.log('构建完成!');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
}
