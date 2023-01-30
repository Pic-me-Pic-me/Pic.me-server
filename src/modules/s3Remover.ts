import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3Config";
import config from "../config/index";
import { ObjectIdentifier } from "../interfaces/ObjectIdentifier";

const deleteImages = async (urls: ObjectIdentifier[]) => {
    try {
        const data = await s3.send(
            new DeleteObjectsCommand({
                Bucket: config.bucketName,
                Delete: {
                    Objects: urls,
                },
            })
        );

        return data;
    } catch (err) {
        console.log("[Error]", err);
    }
};

export default {
    deleteImages,
};
