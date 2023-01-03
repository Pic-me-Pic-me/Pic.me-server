import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import { UserCreateDTO } from "../interfaces/UserCreateDTO";
import jwtHandler from "../modules/jwtHandler";

const chkDuplicateByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email
        },
    });

    if (user) return true;

    return false;
}

const chkDuplicateByUserName = async (username: string) => {
    const user = await prisma.user.findFirst({
        where: {
            user_name: username
        },
    });

    if (user) return true;

    return false;
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
    if(await chkDuplicateByEmail(userCreateDto.email)) return null;
    if(await chkDuplicateByUserName(userCreateDto?.username)) return null;

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
