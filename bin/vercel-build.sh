#!/bin/bash

# 只构建服务器部分
echo "构建服务器..."
cd packages/server && yarn build
echo "构建服务器完成!"

# 确保根目录dist文件夹存在
mkdir -p ../../dist

# 复制服务器构建输出到根目录dist
echo "复制构建输出到根目录dist文件夹..."
cp -r dist/* ../../dist/

echo "构建完成!"
