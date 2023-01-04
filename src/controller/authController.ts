import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authService } from "../service";
import { rm, sc } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { fail, success } from "../constants/response";
import jwtHandler from "../modules/jwtHandler";

const createUser = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }

    const userCreateDto: UserCreateDTO = req.body;
    const data = await authService.createUser(userCreateDto);

    if (!data) {
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.SIGNUP_FAIL));
    }

    const accessToken = jwtHandler.sign(data.user_id);

    const result = {
        id: data.user_id,
        userName: data.user_name,
        refreshToken: data.refresh_token,
        accessToken,
    };

    return res.status(sc.CREATED).send(success(sc.CREATED, rm.SIGNUP_SUCCESS, result));
};

const signInUser = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }
  
    const userSignInDto: UserSignInDTO = req.body;
  
    try {
        const data = await authService.signIn(userSignInDto);
    
        if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.INVALID_EMAIL));
        else if (data === sc.UNAUTHORIZED)
            return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_PASSWORD));
    
        const userName = await authService.getEmailById(data!);

        const accessToken = jwtHandler.sign(data);
    
        const result = {
            id: data,
            userName: userName,
            accessToken,
        };
    
        res.status(sc.OK).send(success(sc.OK, rm.SIGNIN_SUCCESS, result));
    } catch (e) {
        console.log(error);
        res
          .status(sc.INTERNAL_SERVER_ERROR)
          .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
};

const authController = {
    createUser,
    signInUser
};

export default authController;