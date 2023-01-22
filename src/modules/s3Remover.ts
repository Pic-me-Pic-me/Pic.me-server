import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3Config";
import { ObjectIdentifier } from "../interfaces/ObjectIdentifier";

const deleteImages = async (urls: ObjectIdentifier[]) => {
    try {
        const data = await s3.send(
            new DeleteObjectsCommand({
                Bucket: "picmeserver-bucket",
                Delete: {
                    Objects: urls,
                },
            })
        );

        console.log("[success] object deleted!");
        return data;
    } catch (err) {
        console.log("[Error]", err);
    }
};

export default {
    deleteImages,
};
