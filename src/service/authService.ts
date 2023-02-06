import bcrypt from "bcryptjs";
import kakaoAuth from "../config/kakaoAuth";
import { PrismaClient } from "@prisma/client";
import jwtHandler from "../modules/jwtHandler";
import { sc, rm, socialType } from "../constants";
import { PicmeException } from "../models/PicmeException";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { tokenRefreshDTO } from "../interfaces/tokenRefreshDTO";

const prisma = new PrismaClient();

/**
 * get user info by email
 *
 * @param {string} email user email
 */
const chkByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    return user;
};

/**
 * get user info by username
 *
 * @param {string} username user's username
 */
const chkByUserName = async (username: string) => {
    const user = await prisma.user.findFirst({
        where: {
            user_name: username,
        },
    });

    return user;
};

/**
 * get user info by user id
 *
 * @param {number} id user's unique id
 */
const findById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });

    return user;
};

/**
 * find user by unique kakaoId, and social type
 *
 * @param {number} kakaoId unique kakao id provided by kakao
 * @param {string} socialType social type
 */
const findByKey = async (kakaoId: number, socialType: string) => {
    const auth = await prisma.authenticationProvider.findFirst({
        where: {
            id: kakaoId,
            provider_type: socialType,
        },
    });
    if (!auth) throw new PicmeException(sc.BAD_REQUEST, false, rm.CHECK_KAKAO_USER_FAIL);
    const user = await findById(auth.user_id);
    if (!user) throw new PicmeException(sc.BAD_REQUEST, false, rm.NO_USER);
    return user;
};

/**
 * create pic.me user account
 *
 * @param {UserCreateDTO} userCreateDto DTO for creating user
 */
const createUser = async (userCreateDto: UserCreateDTO) => {
    if (await chkByEmail(userCreateDto.email)) return null;
    if (await chkByUserName(userCreateDto?.username)) return null;

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(userCreateDto.password, salt);

    const data = await prisma.user.create({
        data: {
            user_name: userCreateDto?.username,
            email: userCreateDto.email,
            refresh_token: "",
            password,
        },
    });

    const user = await updateRefreshToken(data.id);

    return user;
};

/**
 * sign in pic.me user account
 *
 * @param {UserSignInDTO} userSignInDto DTO for signIn user
 */
const signIn = async (userSignInDto: UserSignInDTO) => {
    try {
        const user = await chkByEmail(userSignInDto.email);

        if (!user) return null;

        const isMatch = await bcrypt.compare(userSignInDto.password, user.password!);

        if (!isMatch) return sc.UNAUTHORIZED;

        return user.id;
    } catch (error) {
        throw error;
    }
};

/**
 * get user from kakao auth API
 *
 * @param {string} social social type: kakao
 * @param {string} token kakao API access token
 */
const getUser = async (social: string, token: string) => {
    if (social != socialType.KAKAO)
        throw new PicmeException(sc.BAD_REQUEST, false, rm.NO_SOCIAL_TYPE);
    const user = await kakaoAuth(token);
    if (!user) throw new PicmeException(sc.BAD_REQUEST, false, rm.INVALID_TOKEN);
    return user;
};

/**
 *  create picme account for authorized kakao user
 *
 * @param {string} email user kakao email
 * @param {string} nickname user's username
 * @param {number} kakaoId unique kakao id provided by kakao
 */
const createSocialUser = async (email: string, nickname: string, kakaoId: number) => {
    if (await chkByUserName(nickname)) return null;
    const user = await prisma.user.create({
        data: {
            user_name: nickname,
            email: email,
            password: "",
            refresh_token: "",
        },
    });

    await prisma.authenticationProvider.create({
        data: {
            user_id: user.id,
            provider_type: socialType.KAKAO,
            id: kakaoId,
        },
    });
    const data = await updateRefreshToken(user.id);
    return data;
};

/**
 * update refreshToken for signin, signup
 *
 * @param {number} userId unique kakao id provided by kakao
 */
const updateRefreshToken = async (userId: number) => {
    const refreshToken = jwtHandler.signRefresh(userId);
    const data = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            refresh_token: refreshToken,
        },
    });

    return data;
};

/**
 * update accessToken with refreshToken
 *
 * @param {number} userId user's unique id
 * @param {tokenRefreshDTO} tokenRefreshDto DTO for token refresh
 */
const tokenRefresh = async (userId: number, tokenRefreshDto: tokenRefreshDTO) => {
    const user = await findById(userId);

    if (user?.refresh_token != tokenRefreshDto.refreshToken) return null;

    const accessToken = jwtHandler.sign(userId);

    return accessToken;
};

const authService = {
    createUser,
    signIn,
    getUser,
    findByKey,
    createSocialUser,
    updateRefreshToken,
    tokenRefresh,
};

export default authService;
