cd /home/ubuntu/Pic.me-server

sudo chown -R ubuntu:ubuntu /home/ubuntu/Pic.me-server
chmod 777 /home/ubuntu/Pic.me-server
chmod 777 /home/ubuntu/Pic.me-server/*/**

REPOSITORY=/home/ubuntu/Pic.me-server

cd $REPOSITORY

sudo /usr/bin/pm2 kill

sudo /usr/bin/yarn

if [ "$DEPLOYMENT_GROUP_NAME" == "mainDeployGroup" ]
then
    sudo /usr/bin/yarn run deploy:prod
fi

if [ "$DEPLOYMENT_GROUP_NAME" == "testDeployGroup" ]
then
    sudo /usr/bin/yarn run deploy:dev
fi