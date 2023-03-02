import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { authService } from "../service";
import { rm, sc } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { tokenRefreshDTO } from "../interfaces/tokenRefreshDTO";
import { SocialUser } from "../interfaces/SocialUserDTO";
import { fail, success } from "../constants/response";
import { JwtPayload } from "jsonwebtoken";
import tokenType from "../constants/tokenType";
import jwtHandler from "../modules/jwtHandler";
import { PicmeException } from "../models/PicmeException";
import setCookie from "../modules/setCookie";

/**
 * sign up with pic.me authentication
 *
 * @api {post} /auth
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const userCreateDto: UserCreateDTO = req.body;

    try {
        const data = await authService.createUser(userCreateDto);

        const accessToken = jwtHandler.sign(data.id);

        const result = {
            id: data.id,
            userName: data.user_name,
            accessToken,
        };

        const cookieString = setCookie.setRefreshTokenCookie(data.refresh_token!);

        res.setHeader("Set-Cookie", cookieString);

        return res.status(sc.CREATED).send(success(sc.CREATED, rm.SIGNUP_SUCCESS, result));
    } catch (e) {
        return next(e);
    }
};

/**
 * sign in with pic.me authentication
 *
 * @api {post} /auth/signin
 */
const signInUser = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const userSignInDto: UserSignInDTO = req.body;

    try {
        const data = await authService.signIn(userSignInDto);

        const user = await authService.updateRefreshToken(data);

        const accessToken = jwtHandler.sign(data);

        const result = {
            id: data,
            userName: user.user_name,
            accessToken,
        };

        const cookieString = setCookie.setRefreshTokenCookie(user.refresh_token!);

        res.setHeader("Set-Cookie", cookieString);

        return res.status(sc.OK).send(success(sc.OK, rm.SIGNIN_SUCCESS, result));
    } catch (e) {
        return next(e);
    }
};

/**
 * sign up with kakao
 *
 * @api {post} /auth/kakao
 */
const createSocialUser = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const { uid, socialType, userName, email } = req.body;

    try {
        let existUser = await authService.findByKey(uid, socialType);

        if (existUser) return next(new PicmeException(sc.BAD_REQUEST, false, rm.ALREADY_USER));

        const data = await authService.createSocialUser(email, userName, uid);

        const accessToken = jwtHandler.sign(data.id);

        const result = {
            id: data.id,
            userName: userName,
            accessToken: accessToken,
        };

        const cookieString = setCookie.setRefreshTokenCookie(data.refresh_token!);

        res.setHeader("Set-Cookie", cookieString);

        return res.status(sc.OK).send(success(sc.OK, rm.SOCIAL_SIGNUP_SUCCESS, result));
    } catch (e) {
        return next(e);
    }
};

/**
 * check whether kakao user is a user of pic.me
 *
 * @api {post} /auth/kakao/check
 */
const findSocialUser = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const { socialType, token } = req.body;

    try {
        const user = await authService.getUser(socialType, token);

        const existUser = await authService.findByKey((user as SocialUser).userId, socialType);

        let data = {
            uid: (user as SocialUser).userId,
            email: (user as SocialUser).email,
            isUser: true,
        };

        if (!existUser) {
            data.isUser = false;
            return res.status(sc.OK).send(success(sc.OK, rm.CHECK_KAKAO_USER_SUCCESS, data));
        }

        return res.status(sc.OK).send(success(sc.OK, rm.CHECK_KAKAO_USER_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

/**
 * check whether kakao user is a user of pic.me
 *
 * @api {post} /auth/kakao/signin
 */
const loginSocialUser = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const { uid, socialType } = req.body;

    try {
        const existUser = await authService.findByKey(uid, socialType);

        if (!existUser)
            return next(new PicmeException(sc.BAD_REQUEST, false, rm.CHECK_KAKAO_USER_FAIL));

        const updatedUser = await authService.updateRefreshToken(existUser!.id);

        const accessToken = jwtHandler.sign(updatedUser.id);

        const result = {
            id: updatedUser.id,
            userName: updatedUser.user_name,
            accessToken: accessToken,
        };

        const cookieString = setCookie.setRefreshTokenCookie(updatedUser.refresh_token!);

        res.setHeader("Set-Cookie", cookieString);

        return res.status(sc.OK).send(success(sc.OK, rm.SOCIAL_SIGNIN_SUCCESS, result));
    } catch (e) {
        return next(e);
    }
};

/**
 * refresh accessToken
 *
 * @api {post} /auth/token
 */
const tokenRefresh = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const cookie = req.headers["cookie"];

    if (!cookie) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));
    }

    const refreshToken = cookie.split("=")[1];

    const tokenRefreshDto: tokenRefreshDTO = {
        accessToken: req.body.accessToken,
        refreshToken: refreshToken,
    };

    //verify tokens
    const refreshDecoded = jwtHandler.verify(tokenRefreshDto.refreshToken);
    const decoded = jwtHandler.verify(tokenRefreshDto.accessToken);

    // refreshToken, accessToken all expired
    if (refreshDecoded === tokenType.TOKEN_EXPIRED && decoded === tokenType.TOKEN_EXPIRED)
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.EXPIRED_ALL_TOKEN));

    // refreshToken expired
    if (refreshDecoded === tokenType.TOKEN_EXPIRED)
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.EXPIRED_REFRESH_TOKEN));

    // refreshToken or accessToken invalid
    if (refreshDecoded === tokenType.TOKEN_INVALID || decoded === tokenType.TOKEN_INVALID)
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.INVALID_TOKEN));

    // accessToken still valid
    const accessDecodedUID: number = (decoded as JwtPayload).userId;

    if (accessDecodedUID)
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.VALID_ACCESS_TOKEN));

    const refreshDecodedUID: number = (refreshDecoded as JwtPayload).userId;
    if (!refreshDecodedUID)
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.INVALID_REFRESH_TOKEN));

    try {
        const newAccessToken = await authService.tokenRefresh(refreshDecodedUID, tokenRefreshDto);

        if (!newAccessToken)
            return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NOT_TOKEN_OWNER));

        const result = {
            accessToken: newAccessToken,
        };

        return res.status(sc.OK).send(success(sc.OK, rm.CREATE_TOKEN_SUCCESS, result));
    } catch (e) {
        return next(e);
    }
};

const authController = {
    createUser,
    signInUser,
    tokenRefresh,
    createSocialUser,
    findSocialUser,
    loginSocialUser,
};

export default authController;
