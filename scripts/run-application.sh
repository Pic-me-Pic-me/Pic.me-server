REPOSITORY=/home/ubuntu/Pic.me-server

cd $REPOSITORY

sudo pm2 kill

sudo yarn

sudo cross-env NODE_ENV=$ pm2 start dist

if [ "$DEPLOYMENT_GROUP_NAME" == "mainDeployGroup" ]
then
    sudo yarn deploy:prod
fi

if [ "$DEPLOYMENT_GROUP_NAME" == "testDeployGroup" ]
then
    sudo yarn deploy:dev
fi