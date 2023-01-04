import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authService } from "../service";
import { rm, sc } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { SocialUser } from "../interfaces/SocialUser";
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

    if(!social || !token) //없는 경우
        return;
    const user=await authService.getUser(social, token);
    //여기에 email, 카카오 userId가 있음

        // 유저가 없는 경우 & 토큰이 유효하지않은 경우
    if(!user)
        return res.status(sc.NOT_FOUND).send(fail(sc.NOT_FOUND, rm.NO_SOCIAL_USER));

    //회원가입 했는지 확인하기 - id로 확인하기
    const existUser=await authService.findByKey((user as SocialUser).userId, social);
    
    if(!existUser){ //id를 받는다. 
        return await authService.createSocialUser((user as SocialUser).email!);
    }

    //있다면 새 토큰으로 발급해주고 업데이트
    await authService.updateRefreshToken(existUser.id);
};

const authController = {
    createUser,
    signInUser,
    getUser,
};

export default authController;
