import { Request, Response } from "express";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { VoteCreateDTO } from "../interfaces/VoteCreateDTO";
import userService from "../service/userService";

const getUserInfo = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const data = await userService.getUserInfo(+userId);

    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.CANT_GET_USERINFO));

    return res.status(sc.OK).send(success(sc.OK, rm.GET_USER_INFO, data));
};

const checkUserName = async (req: Request, res: Response) => {
    const { userName } = req.query;
    const result = await userService.checkUserName(userName as string);

    if (result == sc.OK) return res.status(sc.OK).send(success(sc.OK, rm.UNIQUE_USER_NAME));
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, "중복된 아이디가 있습니다."));
};

const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const result = await userService.deleteUser(+userId);
    if (result == sc.NOT_FOUND)
        return res.status(sc.BAD_REQUEST).send(fail(sc.NO_CONTENT, rm.DELETE_USER_FAIL));
    return res.status(sc.OK).send(success(sc.OK, rm.DELETE_USER_SUCCESS));
};

const userController = {
    getUserInfo,
    checkUserName,
    deleteUser,
};

export default userController;
