if [ "$BUILD_ENV" = "production" ] || [ "$BUILD_ENV" = "staging" ]; then
  echo "NODE_ENV=production" > packages/server/.env
else
  echo "NODE_ENV=development" > packages/server/.env
fi

npm install --global yarn --registry=http://r.npm.sankuai.com
yarn config set registry http://r.npm.sankuai.com
yarn --ignore-engines
yarn build
