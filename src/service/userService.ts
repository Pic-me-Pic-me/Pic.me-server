import { PrismaClient } from "@prisma/client";
import { sc } from "../constants";
import { GetUserInfoDTO } from "../interfaces/GetUserInfoDTO";

const prisma = new PrismaClient();

const getUserInfo = async (userId: number) => {
    const data = await prisma.user.findUnique({
        select: {
            user_name: true,
            email: true,
        },
        where: {
            id: userId,
        },
    });

    if (!data) return null;

    const resultDTO: GetUserInfoDTO = {
        userName: data?.user_name as string,
        email: data?.email as string,
    };

    return resultDTO;
};

const checkUserName = async (userName: string) => {
    const data = await prisma.user.findFirst({
        where: {
            user_name: userName,
        },
    });
    console.log(data);
    if (!data) return sc.OK;

    if (data) return sc.CONFLICT;
};

const userService = {
    getUserInfo,
    checkUserName,
};

export default userService;
