REPOSITORY=/home/ubuntu/Pic.me-server

cd $REPOSITORY

pm2 kill

yarn

if [ "$DEPLOYMENT_GROUP_NAME" == "mainDeployGroup" ]
then
    yarn run deploy:prod
fi

if [ "$DEPLOYMENT_GROUP_NAME" == "testDeployGroup" ]
then
    yarn run deploy:dev
fi