import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import { sc } from "../constants";
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

    const refreshToken = jwtHandler.signRefresh(data.id);

    await prisma.user.update({
        where: {
            id: data.id,
        },
        data: {
            refresh_token: refreshToken,
        },
    });

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

const getUser = async(socialType:string, token:string) => {
    let user;

    user=await kakaoAuth(token);
    return user;
};

const findByKey= async(userId: string, socialType:string) =>{
    const user=await prisma.authentication_provider.findFirst({
        where:{
            socialType:socialType,
            id:userId
        }
    }); //여기서 ... email도 받야야 함. 
    return user.user_id;
};

const createSocialUser = async(email: string) =>{
    const user=await prisma.user.create({
        user_name:"",
        email: email,
        password:"",
        refresh_token:""
    });
    const auth=await prisma.autentication_provider.create({
        user_id:user.id,
        provider_type: "kakao"
    });
    await updateRefreshToken(user.id);
};

const updateRefreshToken = async(userId: number) => {
    const refreshToken = jwtHandler.signRefresh(userId);
    await prisma.user.update({
        where:{
            id: userId
        },
        data:{
            refresh_token: refreshToken
        }
    });
}

const authService = {
    createUser,
    signIn,
    getEmailById,
    getUser,
    findByKey,
    createSocialUser,
    updateRefreshToken
};

export default authService;
