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

/**
 * sign up with pic.me authentication
 *
 * @api {post} /auth
 */
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

/**
 * sign in with pic.me authentication
 *
 * @api {post} /auth/signin
 */
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
            return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.INVALID_PASSWORD));

        const user = await authService.updateRefreshToken(data);

        const accessToken = jwtHandler.sign(data);

        const result = {
            id: data,
            userName: user.user_name,
            refreshToken: user.refresh_token,
            accessToken,
        };

        res.status(sc.OK).send(success(sc.OK, rm.SIGNIN_SUCCESS, result));
    } catch (e) {
        res.status(sc.INTERNAL_SERVER_ERROR).send(
            fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR)
        );
    }
};

/**
 * sign up with kakao
 *
 * @api {post} /auth/kakao
 */
const createSocialUser = async (req: Request, res: Response, next: NextFunction) => {
    const { uid, socialType, userName, email } = req.body;

    try {
        let existUser = await authService.findByKey(uid, socialType);

        if (existUser)
            return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.ALREADY_USER));

        const data = await authService.createSocialUser(email, userName, uid);

        if (!data)
            return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.ALREADY_NICKNAME));

        const accessToken = jwtHandler.sign(data.id);

        const result = {
            id: data.id,
            userName: userName,
            accessToken: accessToken,
            refreshToken: data.refresh_token,
        };

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
    const { socialType, token } = req.body;

    if (!socialType || !token)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));

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
    const { uid, socialType } = req.body;

    if (!uid || !socialType)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));

    try {
        const existUser = await authService.findByKey(uid, socialType);

        const updatedUser = await authService.updateRefreshToken(existUser.id);
        const accessToken = jwtHandler.sign(updatedUser.id);
        const result = {
            id: updatedUser.id,
            user_name: updatedUser.user_name,
            accessToken: accessToken,
            refreshToken: updatedUser.refresh_token,
        };

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
const tokenRefresh = async (req: Request, res: Response) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.EMPTY_TOKEN));
    }

    const tokenRefreshDto: tokenRefreshDTO = req.body;

    //verify tokens
    const refreshDecoded = jwtHandler.verify(tokenRefreshDto.refreshToken);
    const decoded = jwtHandler.verify(tokenRefreshDto.accessToken);

    // refreshToken, accessToken all expired
    if (refreshDecoded === tokenType.TOKEN_EXPIRED && decoded === tokenType.TOKEN_EXPIRED)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.EXPIRED_ALL_TOKEN));

    // refreshToken expired
    if (refreshDecoded === tokenType.TOKEN_EXPIRED)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.EXPIRED_REFRESH_TOKEN));

    // refreshToken or accessToken invalid
    if (refreshDecoded === tokenType.TOKEN_INVALID || decoded === tokenType.TOKEN_INVALID)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.INVALID_TOKEN));

    // accessToken still valid
    const accessDecodedUID: number = (decoded as JwtPayload).userId;
    if (accessDecodedUID)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.VALID_ACCESS_TOKEN));

    const refreshDecodedUID: number = (refreshDecoded as JwtPayload).userId;
    if (!refreshDecodedUID)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.INVALID_REFRESH_TOKEN));

    const newAccessToken = await authService.tokenRefresh(refreshDecodedUID, tokenRefreshDto);

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
    findSocialUser,
    loginSocialUser,
};

export default authController;
