import { AlarmPushDTO } from "../interfaces/AlarmPushDTO";
import { AlarmUserPayloadDTO } from "../interfaces/AlarmUserPayloadDTO";
import { AlarmPayloadDTO } from "../interfaces/AlarmPayloadDTO";
import { AlarmRegisterDTO } from "../interfaces/AlarmRegisterDTO";
import { PrismaClient } from "@prisma/client";
import { PicmeException } from "../models/PicmeException";
import { sc, rm } from "../constants";
import webpush from "web-push";
import config from "../config";

const subjects = config.webPushSubject;
webpush.setVapidDetails(subjects, config.webPushPublicKey, config.webPushPrivateKey);

const prisma = new PrismaClient();

/**
 * get user info by username
 *
 * @param {string} title title to send
 * @param {string} message message to send
 */
const push = async (alarmPushDTO: AlarmPushDTO) => {
    const { userId, title, message } = alarmPushDTO;

    const data = await prisma.user.findUnique({
        select: {
            web_token: true,
            secret_key: true,
            public_key: true,
        },
        where: {
            id: userId,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.NO_USER);

    //one to one, if null -> error, one to many -> if null, pass and register again

    const alarmPayload: AlarmPayloadDTO = {
        title: title,
        body: message,
    };

    const userPayload: AlarmUserPayloadDTO = {
        endpoint: data.web_token!,
        keys: {
            p256dh: data.public_key!,
            auth: data.secret_key!,
        },
    };

    const options = {
        TTL: 3600,
    };

    try {
        webpush.sendNotification(userPayload, JSON.stringify(alarmPayload), options);

        return;
    } catch (e) {
        throw new PicmeException(sc.BAD_REQUEST, false, rm.PUSH_NOTIFICATION_FALED);
    }
};

/**
 * get user info by username
 *
 * @param {string} endpoint webtoken
 * @param {Object} keys public, private key
 */
const register = async (alarmUserPayloadDTO: AlarmRegisterDTO) => {
    const data = await prisma.user.update({
        where: {
            id: alarmUserPayloadDTO.userId,
        },
        data: {
            web_token: alarmUserPayloadDTO.endpoint,
            secret_key: alarmUserPayloadDTO.keys.auth,
            public_key: alarmUserPayloadDTO.keys.p256dh,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.PUSH_NOTIFICATION_REGISTER_FALED);

    return;
};

const alarmService = {
    push,
    register,
};

export default alarmService;
