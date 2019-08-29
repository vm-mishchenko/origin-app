#!/usr/bin/env bash
cd ~/experients/ngx-wall
# connect ngx-wall dist folder to origin project
#  share ngx-wall dist folder
mkdir -p dist/ngx-wall
#  create fake file because if dist/ngx-wall is empty
#  npm link parent ngx-wall folder instead of dist/ngx-wall
touch README.md
cd dist/ngx-wall
npm link
#  link ngx-wall dist folder to origin-app
cd ~/experients/origin-app
npm link ngx-wall

# launch ngx-wall dev process
cd ~/experients/ngx-wall
npm run build-for-origin
