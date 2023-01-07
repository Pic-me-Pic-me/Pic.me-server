import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authService } from "../service";
import { rm, sc } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { SocialUser } from "../interfaces/SocialUserDTO";
import { fail, success } from "../constants/response";
import { JwtPayload } from "jsonwebtoken";
import tokenType from "../constants/tokenType";
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
        else if (data === sc.UNAUTHORIZED)
            return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_PASSWORD));

        const userName = await authService.getEmailById(data!);

        const user = await authService.updateRefreshToken(data);

        const accessToken = jwtHandler.sign(data);

        const result = {
            id: data,
            userName: userName,
            refreshToken: user.refresh_token,
            accessToken,
        };

        res.status(sc.OK).send(success(sc.OK, rm.SIGNIN_SUCCESS, result));
    } catch (e) {
        console.log(error);
        res.status(sc.INTERNAL_SERVER_ERROR).send(
            fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR)
        );
    }
};

const createSocialUser = async (req: Request, res: Response) => {
    const uid = req.body.uid; // 카카오 아이디
    const social = req.body.socialType;
    const nickname = req.body.userName;
    let existUser = await authService.findByKey(uid, social);

    if (existUser)
        return res
            .status(sc.BAD_REQUEST)
            .send(fail(sc.BAD_REQUEST, "이미 회원가입 된 소셜 유저입니다."));

    const kakaoUser = await authService.getUser(uid, social);

    if (!kakaoUser)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, "소셜 유저가 아빈디ㅏ"));
    const data = await authService.createSocialUser(
        (kakaoUser as SocialUser).email as string,
        nickname,
        uid
    );
    const accessToken = jwtHandler.sign(data.id);
    const result = {
        id: data.id,
        accessToken: accessToken,
        refreshToken: data.refresh_token,
    };
    return res.status(sc.OK).send(success(sc.OK, rm.SOCIAL_SIGNUP_SUCCESS, result));
};

const findSocialUSer = async (req: Request, res: Response) => {
    // 중복확인 - 이미 존재하는 사용자인지.아 여기서 카카오한테 보내기
    const social = req.body.socialType;
    const token = req.body.token;

    if (!social || !token)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));

    const user = await authService.getUser(social, token);

    if (!user)
        // 토큰이 없는 경우
        return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_TOKEN));
    if (user == rm.NO_SOCIAL_TYPE)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NO_SOCIAL_TYPE));
    if (user == rm.NO_SOCIAL_USER)
        //소셜에 있는 사용자가 아닌 경우
        return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.NO_SOCIAL_USER));
    const existUser = await authService.findByKey((user as SocialUser).userId, social);

    if (!existUser) {
        const data = {
            uid: (user as SocialUser).userId,
            isUser: false,
        };
        return res.status(sc.OK).send(success(sc.OK, rm.IS_SOCIAL_USER, data));
    }
    const data = {
        uid: (user as SocialUser).userId,
        isUser: true,
    };
    return res.status(sc.OK).send(success(sc.OK, rm.IS_SOCIAL_USER, data));
};

const loginSocialUser = async (req: Request, res: Response) => {
    // 로그인하기 - 토큰 재발급
    const userId = req.body.uid; //카카오 아이디로 id찾기
    const social = req.body.socialType;
    if (!userId || !social)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    const existUser = await authService.findByKey(userId, social);

    if (!existUser)
        return res
            .status(sc.UNAUTHORIZED)
            .send(fail(sc.UNAUTHORIZED, "회원가입 하지 않은 소셜 유저입니다."));

    const updatedUser = await authService.updateRefreshToken(existUser.id);
    const accessToken = jwtHandler.sign(updatedUser.id);
    const result = {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        accessToken: accessToken,
        refreshToken: updatedUser.refresh_token,
    };

    return res.status(sc.OK).send(success(sc.OK, rm.SOCIAL_SIGNIN_SUCCESS, result));
};

const tokenRefresh = async (req: Request, res: Response) => {
    const { refreshToken, accessToken } = req.body;

    if (!refreshToken || !accessToken)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.EMPTY_TOKEN));

    const refreshDecoded = jwtHandler.verify(refreshToken);
    const decoded = jwtHandler.verify(accessToken);

    // refreshToken, accessToken all expired
    if (refreshDecoded === tokenType.TOKEN_EXPIRED && decoded === tokenType.TOKEN_EXPIRED)
        return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.EXPIRED_ALL_TOKEN));
    // refreshToken expired
    if (refreshDecoded === tokenType.TOKEN_EXPIRED)
        return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.EXPIRED_TOKEN));
    // refreshToken or accessToken invalid
    if (refreshDecoded === tokenType.TOKEN_INVALID || decoded === tokenType.TOKEN_INVALID)
        return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_TOKEN));

    // accessToken still valid
    const accessTokenChk: number = (decoded as JwtPayload).userId;
    if (accessTokenChk)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.VALID_TOKEN));

    const userId: number = (refreshDecoded as JwtPayload).userId;
    if (!userId) return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_TOKEN));

    const newAccessToken = await authService.tokenRefresh(userId, refreshToken);

    if (!newAccessToken)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NOT_TOKEN_OWNER));

    const result = {
        accessToken: newAccessToken,
    };

    return res.status(sc.OK).send(success(sc.OK, rm.CREATE_TOKEN_SUCCESS, result));
};

const authController = {
    createUser,
    signInUser,
    tokenRefresh,
    createSocialUser,
    findSocialUSer,
    loginSocialUser,
};

export default authController;
