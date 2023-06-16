import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { PicmeException } from "../models/PicmeException";
import { rm, sc } from "../constants";
import { AlarmPushDTO } from "../interfaces/AlarmPushDTO";
import { AlarmRegisterDTO } from "../interfaces/AlarmRegisterDTO";
import { fail, success } from "../constants/response";
import { alarmService } from "../service";

/**
 * push into notifications
 *
 * @api {post} /alarm/push
 */
const push = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const alarmPushDTO: AlarmPushDTO = req.body;

    try {
        await alarmService.push(alarmPushDTO);

        return res.status(sc.OK).send(success(sc.OK, rm.PUSH_NOTIFICATION_SUCCESS));
    } catch (e) {
        return next(e);
    }
};

/**
 * push into notifications
 *
 * @api {post} /alarm/register
 */
const register = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const alarmRegisterDTO: AlarmRegisterDTO = req.body;

    try {
        await alarmService.register(alarmRegisterDTO);

        return res.status(sc.OK).send(success(sc.OK, rm.PUSH_NOTIFICATION_SUCCESS));
    } catch (e) {
        return next(e);
    }
};

const alarmController = {
    push,
    register,
};

export default alarmController;
