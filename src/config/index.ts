import dotenv from "dotenv";

process.env.NODE_ENV === "production"
    ? dotenv.config({ path: `${__dirname}/../../.env.production` })
    : dotenv.config({ path: `${__dirname}/../../.env.development` });

if (!process.env.NODE_ENV) {
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    port: parseInt(process.env.PORT as string, 10) as number,

    // database
    database: process.env.DATABASE_URL as string,

    // AWS
    s3AccessKey: process.env.S3_ACCESS_KEY as string,
    s3SecretKey: process.env.S3_SECRET_KEY as string,
    bucketName: process.env.S3_BUCKET as string,

    // auth
    jwtSecretKey: process.env.JWT_SECRET as string,

    // crypto
    cryptoKey: process.env.CRYPTO_PRIVATE_KEY as string,

    // frontend
    webURL: process.env.REACT_APP_URL as string,
    webFlowerURL: process.env.REACT_APP_FLOWER_URL as string,
    webDomain: process.env.REACT_APP_DOMAIN as string,
    webLocal: process.env.REACT_APP_LOCALHOST as string,

    // web-push
    webPushPublicKey: process.env.WEB_PUSH_PUBLIC_KEY as string,
    webPushPrivateKey: process.env.WEB_PUSH_PRIVATE_KEY as string,
    webPushSubject: process.env.WEB_PUSH_SUBJECT as string,
    webPushURL: process.env.WEB_PUSH_TEST_URL as string,
};
