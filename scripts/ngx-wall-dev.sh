#!/usr/bin/env bash
cd ~/experients/ngx-wall

# connect $LIB dist folder to origin project
# share $LIB dist folder
mkdir -p dist/$LIB

#  create fake file because if dist/$LIB is empty
#  npm link parent $LIB folder instead of dist/$LIB
cp projects/$LIB/package.json dist/$LIB/package.json
cd dist/$LIB
npm link

#  link $LIB dist folder to origin-app
cd ~/experients/origin-app
npm link $LIB

# launch ngx-wall dev process
# I have to run it at the end because it has the "watch flag"
cd ~/experients/ngx-wall
npm run build-for-origin

