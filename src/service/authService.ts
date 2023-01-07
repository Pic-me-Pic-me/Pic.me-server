import { SocialUser } from "./../interfaces/SocialUserDTO";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import { sc, rm, socialType } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import { auth } from "../middlewares";
import jwtHandler from "../modules/jwtHandler";
import kakaoAuth from "../config/kakaoAuth";

const chkByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    return user;
};

const chkByUserName = async (username: string) => {
    const user = await prisma.user.findFirst({
        where: {
            user_name: username,
        },
    });

    return user;
};

const findById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });

    return user;
};

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

    await updateRefreshToken(data.id);

    const user = await findById(data.id);

    return user;
};

const signIn = async (userSignInDto: UserSignInDTO) => {
    try {
        const user = await chkByEmail(userSignInDto.email);
        if (!user) return null;

        const isMatch = await bcrypt.compare(userSignInDto.password, user.password!);
        if (!isMatch) return sc.UNAUTHORIZED;

        return user.id;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getEmailById = async (id: number) => {
    const user = await findById(id);
    return user?.user_name;
};

const getUser = async (social: string, token: string) => {
    if (social != socialType.KAKAO) return rm.NO_SOCIAL_TYPE;
    const user = await kakaoAuth(token);
    if (!user) return null;
    return user;
};

const findByKey = async (kakaoId: string, socialType: string) => {
    const auth = await prisma.authenticationProvider.findFirst({
        where: {
            id: kakaoId,
            provider_type: socialType,
        },
    });
    if (!auth) return null;
    const user = await findById(auth.user_id);
    return user;
};

const createSocialUser = async (email: string, nickname: string, kakaoId: string) => {
    const user = await prisma.user.create({
        data: {
            user_name: nickname,
            email: email,
            password: "",
            refresh_token: "",
        },
    });

    const auth = await prisma.authenticationProvider.create({
        data: {
            user_id: user.id,
            provider_type: socialType.KAKAO,
            id: kakaoId.toString(),
        },
    });
    const data = await updateRefreshToken(user.id);
    return data;
};

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

const tokenRefresh = async (userId: number, refreshToken: String) => {
    const user = await findById(userId);

    if (user?.refresh_token != refreshToken) return null;

    const accessToken = jwtHandler.sign(userId);

    return accessToken;
};

const findByRefreshToken = async (refreshToken: string) => {
    const user = await prisma.user.findFirst({
        where: {
            refresh_token: refreshToken,
        },
    });
    return user;
};

const authService = {
    createUser,
    signIn,
    getEmailById,
    getUser,
    findByKey,
    createSocialUser,
    updateRefreshToken,
    tokenRefresh,
    findByRefreshToken,
};

export default authService;
