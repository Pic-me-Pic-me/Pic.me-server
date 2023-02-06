#!/bin/bash
REPOSITORY=/home/ubuntu/Pic.me-server

cd $REPOSITORY

sudo chown -R ubuntu:ubuntu /home/ubuntu/Pic.me-server
chmod 777 /home/ubuntu/Pic.me-server
chmod 777 /home/ubuntu/Pic.me-server/*/**

sudo yarn

sudo pm2 kill

if [ "$DEPLOYMENT_GROUP_NAME" == "mainDeployGroup" ]
then
    sudo yarn run db-pull:prod
    sudo yarn run generate:prod
    sudo yarn run deploy:prod
fi

if [ "$DEPLOYMENT_GROUP_NAME" == "testDeployGroup" ]
then
    sudo yarn run db-pull:dev
    sudo yarn run generate:dev
    sudo yarn run deploy:dev
fi