import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import { sc } from "../constants";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import { UserSignInDTO } from "../interfaces/UserSignInDTO";
import jwtHandler from "../modules/jwtHandler";

const chkByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email
        },
    });

    return user;
}

const chkByUserName = async (username: string) => {
    const user = await prisma.user.findFirst({
        where: {
            user_name: username
        },
    });

    return user;
}

const findById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            user_id: id
        },
    });

    return user;
}

const createUser = async (userCreateDto: UserCreateDTO) => {
    if((await chkByEmail(userCreateDto.email))) return null;
    if((await chkByUserName(userCreateDto?.username))) return null;

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(userCreateDto.password, salt); 

    const data = await prisma.user.create({
        data: {
            user_name: userCreateDto?.username,
            email: userCreateDto.email,
            refresh_token: "",
            password,
        }
    });

    const refreshToken = jwtHandler.signRefresh(data.user_id);

    await prisma.user.update({
        where: {
            user_id: data.user_id
        },
        data: {
            refresh_token: refreshToken
        }
    })

    const user = await findById(data.user_id);

    return user;
};

const authService = {
    createUser
};

export default authService;
