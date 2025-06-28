#!/usr/bin/env bash
set -e
[[ ! -d "/data/applogs/onejs" ]] && mkdir -p /data/applogs/onejs

command_exists(){
  command -v $1 >/dev/null 2>&1;
}
export HOME=/home/sankuai
source $HOME/.bashrc || true

FONT_DIR=$HOME/.fonts

[[ ! -d "$FONT_DIR" ]] && mkdir -p "$FONT_DIR"
cp fonts/* $FONT_DIR/
fc-cache -f -v "$FONT_DIR"

NODE_VERSION=v22.0.0  # 替换为需要的node版本
echo 'install nvm node'
if [[ -d ~/.nvm  ]]; then
  echo "nvm was already installed."
else
  echo "install nvm"
  curl -L -o- http://build.sankuai.com/nvm/install | bash
fi

NVM_NODEJS_ORG_MIRROR=http://npm.sankuai.com/mirrors/node
source ~/.bashrc
source ~/.nvm/nvm.sh

nvm install $NODE_VERSION
nvm use $NODE_VERSION

npm install --global yarn --registry=http://r.npm.sankuai.com
yarn config set registry http://r.npm.sankuai.com

yarn start
