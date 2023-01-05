import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authService } from "../service";
import { rm, sc } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { SocialUser } from "../interfaces/SocialUserDTO";
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

    const accessToken = jwtHandler.sign(data.id);

    const result = {
        id: data.id,
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
        else if (data === sc.UNAUTHORIZED) return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_PASSWORD));

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
        res.status(sc.INTERNAL_SERVER_ERROR).send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
};

const getUser = async(req:Request, res:Response)=>{
    const social=req.body.socialType;
    const token=req.body.token;

    if(!social || !token)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));

    const user=await authService.getUser(social, token);
    if(!user)
        return res.status(sc.UNAUTHORIZED).send(fail(sc.NOT_FOUND, rm.INVALID_TOKEN));
    if(user==rm.NO_SOCIAL_USER)
        return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.NO_SOCIAL_USER));

    let existUser=await authService.findByKey((user as SocialUser).userId, social);
    
    if(!existUser){
        const data=await authService.createSocialUser((user as SocialUser).email as string, (user as SocialUser).userId as string);
        return res.status(sc.OK).send(success(sc.OK, rm.SOCIAL_LOGIN_SUCCESS, data));
    }
    const updatedUser= await authService.updateRefreshToken(existUser.id);
    
    return res.status(sc.OK).send(success(sc.OK, rm.SOCIAL_LOGIN_SUCCESS,updatedUser));
};

const authController = {
    createUser,
    signInUser,
    getUser,
};

export default authController;
