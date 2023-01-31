cd /home/ubuntu/Pic.me-server

sudo chown -R ubuntu:ubuntu /home/ubuntu/Pic.me-server
chmod 777 /home/ubuntu/Pic.me-server
chmod 777 /home/ubuntu/Pic.me-server/*/**

REPOSITORY=/home/ubuntu/Pic.me-server

cd $REPOSITORY

pm2 kill

yarn install

if [ "$DEPLOYMENT_GROUP_NAME" == "mainDeployGroup" ]
then
    yarn run deploy:prod
fi

if [ "$DEPLOYMENT_GROUP_NAME" == "testDeployGroup" ]
then
    yarn run deploy:dev
fi