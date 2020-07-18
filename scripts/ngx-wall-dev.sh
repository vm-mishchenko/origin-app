#!/usr/bin/env bash

# ngx-wall here represent a container that contains other libraries other then ngx-wall itself
cd ~/experiments/ngx-wall

echo "Connects $LIB library"

## Connect $LIB "dist" folder to origin project
# create $LIB "dist" folder if it has not existed yet
mkdir -p dist/$LIB

# create fake file because if dist/$LIB is empty than
# npm/link connects $LIB folder instead of dist/$LIB
cp projects/$LIB/package.json dist/$LIB/package.json
cd dist/$LIB
npm link

#  link $LIB dist folder to origin-app
cd ~/experiments/origin-app
npm link $LIB

# launch ngx-wall dev process
# I have to run it at the end because it has the "watch flag"
cd ~/experiments/ngx-wall
npm run build-for-origin
