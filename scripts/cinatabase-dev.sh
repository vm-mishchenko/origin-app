#!/usr/bin/env bash
cd ~/experients/cinatabase

# connect cinatabase folder to origin project
# link cinatabase to global node_modules
npm link

#  link cinatabase folder to origin-app
cd ~/experients/origin-app
npm link cinatabase

# launch ngx-wall dev process
cd ~/experients/cinatabase
npm run build:watch
