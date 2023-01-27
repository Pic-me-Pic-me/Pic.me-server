import { PrismaClient } from "@prisma/client";
import { sc } from "../constants";
import { GetUserInfoDTO } from "../interfaces/GetUserInfoDTO";
import { ObjectIdentifier } from "../interfaces/ObjectIdentifier";
import s3Remover from "../modules/s3Remover";

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

    if (!data) return sc.OK;

    if (data) return sc.CONFLICT;
};

const deleteUser = async (userId: number) => {
    const check = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });

    if (!check) return sc.NOT_FOUND;

    try {
        await prisma.$transaction(async (tx) => {
            const votes = await tx.vote.findMany({
                select: {
                    id: true,
                },
                where: {
                    user_id: userId,
                },
            });

            if (votes.length != 0) {
                const urls: ObjectIdentifier[] = [];

                await Promise.all(
                    votes.map(async (data) => {
                        const picture = await tx.picture.findMany({
                            select: {
                                url: true,
                            },
                            where: {
                                vote_id: data.id,
                            },
                        });

                        const firstImgUrl = picture[0].url;
                        const secondImgUrl = picture[1].url;

                        urls.push(
                            {
                                Key: firstImgUrl.substring(
                                    firstImgUrl.lastIndexOf("/") + 1,
                                    firstImgUrl.length
                                ),
                            },
                            {
                                Key: secondImgUrl.substring(
                                    secondImgUrl.lastIndexOf("/") + 1,
                                    secondImgUrl.length
                                ),
                            }
                        );
                    })
                );

                await s3Remover.deleteImages(urls);
            }

            await tx.user.delete({
                where: {
                    id: userId,
                },
            });
        });
    } catch (error) {
        console.log(error);
        return sc.BAD_REQUEST;
    }

    return sc.OK;
};

const userService = {
    getUserInfo,
    checkUserName,
    deleteUser,
};

export default userService;
