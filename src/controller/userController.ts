import { NextFunction, Request, Response } from "express";
import { rm, sc } from "../constants";
import { success } from "../constants/response";
import userService from "../service/userService";

/**
 * get user's profile info
 *
 * @api {GET} /user
 */
const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    try {
        const data = await userService.getUserInfo(+userId);

        return res.status(sc.OK).send(success(sc.OK, rm.GET_USER_INFO, data));
    } catch (e) {
        return next(e);
    }
};

/**
 * check if user's nickname is duplicated
 *
 * @api {GET} /user/name
 */
const checkUserName = async (req: Request, res: Response, next: NextFunction) => {
    const { userName } = req.query;
    try {
        await userService.checkUserName(userName as string);

        return res.status(sc.OK).send(success(sc.OK, rm.UNIQUE_USER_NAME));
    } catch (e) {
        return next(e);
    }
};

/**
 * withdraw from picme
 *
 * @api {DELETE} /user
 */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;

    try {
        await userService.deleteUser(+userId);

        return res.status(sc.OK).send(success(sc.OK, rm.DELETE_USER_SUCCESS));
    } catch (e) {
        return next(e);
    }
};

const userController = {
    getUserInfo,
    checkUserName,
    deleteUser,
};

export default userController;
