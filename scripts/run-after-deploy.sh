#!/bin/bash
REPOSITORY=/home/ubuntu/Pic.me-server

cd $REPOSITORY

sudo yarn

sudo pm2 kill

sudo yarn run deploy:prod