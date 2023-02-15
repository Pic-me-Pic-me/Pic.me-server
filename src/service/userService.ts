import { PrismaClient } from "@prisma/client";
import { rm, sc } from "../constants";
import { GetUserInfoDTO } from "../interfaces/GetUserInfoDTO";
import { ObjectIdentifier } from "../interfaces/ObjectIdentifier";
import { PicmeException } from "../models/PicmeException";
import s3Remover from "../modules/s3Remover";

const prisma = new PrismaClient();

/**
 * get user's info by unique userNum
 *
 * @param {number} userId unqiue user id
 */
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

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.CANT_GET_USERINFO);

    const resultDTO: GetUserInfoDTO = {
        userName: data?.user_name as string,
        email: data?.email as string,
    };

    return resultDTO;
};

/**
 * check whether if the nickname is in use
 *
 * @param {string} userName requested userName
 */
const checkUserName = async (userName: string) => {
    const data = await prisma.user.findFirst({
        where: {
            user_name: userName,
        },
    });

    if (data) throw new PicmeException(sc.BAD_REQUEST, false, rm.USER_NAME_DUPLICATE);

    if (!data) return sc.OK;
};

/**
 * check whether if the email is in use
 *
 * @param {string} email requested userName
 */
const checkEmail = async (email: string) => {
    const data = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    if (data) throw new PicmeException(sc.BAD_REQUEST, false, rm.USER_EMAIL_DUPLICATE);

    if (!data) return sc.OK;
};

/**
 * withdraw from picme
 *
 * @param {number} userId unique user id
 */
const deleteUser = async (userId: number) => {
    const check = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });

    if (!check) throw new PicmeException(sc.BAD_REQUEST, false, rm.DELETE_USER_FAIL);

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
        throw new PicmeException(sc.BAD_REQUEST, false, rm.DELETE_USER_FAIL);
    }

    return sc.OK;
};

const userService = {
    getUserInfo,
    checkUserName,
    deleteUser,
    checkEmail,
};

export default userService;
