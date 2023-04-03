import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
import { SingleVoteGetDTO } from "./../interfaces/SingleVoteGetDTO";
import { PlayerGetVotedResultDTO } from "./../interfaces/PlayerGetVotedResultDTO";
import { CurrentVotesGetDTO } from "./../interfaces/CurrentVotesGetDTO";
import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { GetAllLibraryResultDTO } from "../interfaces/GetAllLibraryResultDTO";
import { ObjectIdentifier } from "../interfaces/ObjectIdentifier";
import { PrismaClient } from "@prisma/client";
import { PicmeException } from "../models/PicmeException";
import crypto from "../modules/crypto";
import { sc, rm } from "../constants";
import dayjs from "dayjs";
import s3Remover from "../modules/s3Remover";

const prisma = new PrismaClient();

/**
 * create vote with pictures
 *
 * @param {number} userId unique id for each user
 * @param {VoteCreateDTO} VoteCreateDTO vote information with pictures url, title, status, count
 */
const createVote = async (userId: number, voteDTO: VoteCreateDTO) => {
    const data = await prisma.vote.create({
        data: {
            user_id: userId,
            title: voteDTO.title,
            status: true,
            count: 0,
            created_at: dayjs().add(9, "hour").format(),
            date: +dayjs().format("YYYYMM"),
            type: voteDTO.type,
            Picture: {
                create: [
                    { url: voteDTO.pictures[0], count: 0 },
                    { url: voteDTO.pictures[1], count: 0 },
                ],
            },
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.CREATE_VOTE_FAIL);

    return crypto.encodeVoteId(data.id);
};

/**
 * create vote with pictures
 *
 * @param {number} userId unique id for each user
 * @param {string} voteId hashed vote id
 */
const closeVote = async (voteId: string, userId: number) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    const vote = await prisma.vote.findUnique({
        where: {
            id: decodedId,
        },
    });

    if (!vote) throw new PicmeException(sc.BAD_REQUEST, false, rm.CLOSE_VOTE_FAIL);

    if (vote.user_id != userId) throw new PicmeException(sc.BAD_REQUEST, false, rm.VOTE_NOT_ADMIN);

    if (!vote.status) throw new PicmeException(sc.BAD_REQUEST, false, rm.ALREADY_CLOSED_VOTE);

    const data = await prisma.vote.update({
        where: {
            id: decodedId,
        },
        data: {
            status: false,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.CLOSE_VOTE_FAIL);

    return data.id;
};

/**
 * delete vote from library including stored pictures
 *
 * @param {string} voteId hashed vote id
 */
const deleteVote = async (voteId: string) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    try {
        await prisma.$transaction(async (tx) => {
            const pictures = await tx.picture.findMany({
                where: {
                    vote_id: decodedId,
                },
            });

            const urls: ObjectIdentifier[] = pictures.map((data) => {
                return {
                    Key: data.url.substring(data.url.lastIndexOf("/") + 1, data.url.length),
                };
            });

            await s3Remover.deleteImages(urls);

            await tx.vote.delete({
                where: {
                    id: decodedId,
                },
            });
        });
    } catch (error) {
        throw new PicmeException(sc.BAD_REQUEST, false, rm.TRANSACTION_FAILED);
    }
    return sc.OK;
};

/**
 * find vote by vote id and check its ownership
 *
 * @param {number} userId unqiue user id
 * @param {string} userId hashed vote id
 */
const findVoteById = async (userId: number, voteId: string) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    const vote = await prisma.vote.findUnique({
        where: {
            id: decodedId,
        },
    });

    if (!vote) throw new PicmeException(sc.NOT_FOUND, false, rm.NOT_VOTE_ID);

    if (vote.user_id != userId)
        throw new PicmeException(sc.BAD_REQUEST, false, rm.VOTE_USER_NOT_EQUAL);

    return vote;
};

/**
 * get single vote for library
 *
 * @param {string} voteId hashed vote id
 */
const getSingleVote = async (voteId: string) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    const data = await prisma.vote.findUnique({
        select: {
            id: true,
            status: true,
            title: true,
            count: true,
            created_at: true,
            Picture: {
                select: {
                    id: true,
                    url: true,
                    count: true,
                    Sticker: {
                        select: {
                            sticker_location: true,
                            emoji: true,
                            count: true,
                        },
                    },
                },
                orderBy: {
                    count: "desc",
                },
            },
        },
        where: {
            id: decodedId,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.GET_VOTE_FAIL);

    const encodedId = crypto.encodeVoteId(data.id);

    const resultDTO: SingleVoteGetDTO = {
        voteId: encodedId as string,
        voteStatus: data?.status as boolean,
        voteTitle: data?.title as string,
        currentVote: data?.count as number,
        createdDate: data?.created_at as Date,
        Picture: data?.Picture.map((value: any) => {
            let skeleton = [
                {
                    stickerLocation: "",
                    emoji: 0,
                    count: 0,
                },
                {
                    stickerLocation: "",
                    emoji: 1,
                    count: 0,
                },
                {
                    stickerLocation: "",
                    emoji: 2,
                    count: 0,
                },
                {
                    stickerLocation: "",
                    emoji: 3,
                    count: 0,
                },
            ];

            value.Sticker.map((sticker: any) => {
                const index = skeleton.findIndex((e) => e.emoji === sticker.emoji);
                if (index != -1) {
                    skeleton[index].stickerLocation = sticker.sticker_location;
                    skeleton[index].count = sticker.count;
                }
            });

            let DTOs = {
                pictureId: value.id,
                url: value.url,
                count: value.count,
                Sticker: skeleton,
            };

            return DTOs;
        }) as object[],
    };

    return resultDTO;
};

/**
 * get current single vote
 *
 * @param {string} voteId hashed vote id
 */
const getCurrentSingleVote = async (voteId: string) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    const data = await prisma.vote.findUnique({
        select: {
            id: true,
            status: true,
            title: true,
            count: true,
            created_at: true,
            Picture: {
                select: {
                    id: true,
                    url: true,
                    count: true,
                    Sticker: {
                        select: {
                            sticker_location: true,
                            emoji: true,
                            count: true,
                        },
                    },
                },
                orderBy: {
                    id: "asc",
                },
            },
        },
        where: {
            id: decodedId,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.GET_VOTE_FAIL);

    const encodedId = crypto.encodeVoteId(data.id);

    const resultDTO: SingleVoteGetDTO = {
        voteId: encodedId as string,
        voteStatus: data?.status as boolean,
        voteTitle: data?.title as string,
        currentVote: data?.count as number,
        createdDate: data?.created_at as Date,
        Picture: data?.Picture.map((value: any) => {
            let skeleton = [
                {
                    stickerLocation: "",
                    emoji: 0,
                    count: 0,
                },
                {
                    stickerLocation: "",
                    emoji: 1,
                    count: 0,
                },
                {
                    stickerLocation: "",
                    emoji: 2,
                    count: 0,
                },
                {
                    stickerLocation: "",
                    emoji: 3,
                    count: 0,
                },
            ];

            value.Sticker.map((sticker: any) => {
                const index = skeleton.findIndex((e) => e.emoji === sticker.emoji);
                if (index != -1) {
                    skeleton[index].stickerLocation = sticker.sticker_location;
                    skeleton[index].count = sticker.count;
                }
            });

            let DTOs = {
                pictureId: value.id,
                url: value.url,
                count: value.count,
                Sticker: skeleton,
            };

            return DTOs;
        }) as object[],
    };

    return resultDTO;
};

/**
 * get current vote list
 *
 * @param {number} userId user unique id
 * @param {string} cursorId hashed vote id
 */
const getCurrentVotes = async (userId: number, cursorId: string) => {
    const isFirstPage = cursorId === "0" ? true : false;

    const decodedId = +crypto.decodeVoteId(cursorId);

    const pageCondition = {
        skip: 1,
        cursor: {
            id: decodedId,
        },
    };

    const data = await prisma.vote.findMany({
        select: {
            id: true,
            title: true,
            created_at: true,
            count: true,
            date: true,
            type: true,
            Picture: {
                select: {
                    url: true,
                },
                orderBy: {
                    id: "asc",
                },
            },
        },
        where: {
            user_id: userId,
            status: true,
        },
        orderBy: {
            id: "desc",
        },
        take: 5,
        ...(!isFirstPage && pageCondition),
    });

    if (data.length == 0) return null;

    const result: CurrentVotesGetDTO[] = data.map((value: any) => {
        let DTOs = {
            voteId: crypto.encodeVoteId(value.id) as string,
            title: value.title as string,
            voteThumbnail: value.Picture[0]?.url as string,
            createdAt: value.created_at as string,
            totalVoteCount: value.count as number,
            type: value.type as number,
        };
        return DTOs;
    });

    const resCursorId = crypto.encodeVoteId(data[data.length - 1].id);
    return { result, resCursorId };
};

/**
 * get library vote list - updown
 *
 * @param {number} userId user unique id
 * @param {string} flag date number
 */
const getVoteLibrary = async (userId: number, flag: number) => {
    let dates = await prisma.vote.groupBy({
        by: ["date"],
        where: {
            user_id: userId,
            status: false,
        },
        orderBy: {
            date: "desc",
        },
    });

    if (dates.length == 0) return [];

    if (flag == 0) {
        dates = dates.splice(0, 3);
    } else {
        const index = dates.findIndex((data) => data.date === flag);

        if (index == -1) return [];

        dates = dates.splice(index + 1, 3);
    }

    const data = dates.map((data) => {
        return data.date;
    });

    return data;
};

/**
 * get library vote list - updown
 *
 * @param {number} userId user unique id
 * @param {number} date date number
 * @param {string} flag hashed vote id
 */
const getVoteReminder = async (userId: number, date: number, flag: string) => {
    const isFirstPage = flag === "0" ? true : false;

    const decodedId = +crypto.decodeVoteId(flag);

    const pageCondition = {
        skip: 1,
        cursor: {
            id: +decodedId,
        },
    };

    let voteData = await prisma.vote.findMany({
        where: {
            date: date as number,
            user_id: userId,
            status: false,
        },
        select: {
            id: true,
            title: true,
            count: true,
            created_at: true,
            type: true,
            Picture: {
                select: {
                    url: true,
                },
                orderBy: {
                    count: "desc",
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
        take: 5,
        ...(!isFirstPage && pageCondition),
    });

    const result = voteData.map((value: any) => {
        let votesDTO = {
            id: crypto.encodeVoteId(value.id),
            title: value.title,
            count: value.count,
            url: value.Picture[0].url,
            createdAt: value.created_at,
            type: value.type,
        };
        return votesDTO;
    });

    return result;
};

/*
   player
*/

/**
 * get current pictures in vote
 *
 * @param {string} voteId hashed vote id
 */
const playerGetPictures = async (voteId: string) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    const data = await prisma.vote.findFirst({
        select: {
            id: true,
            status: true,
            title: true,
            type: true,
            Picture: {
                select: {
                    id: true,
                    url: true,
                },
                orderBy: {
                    id: "asc",
                },
            },
            User: {
                select: {
                    user_name: true,
                },
            },
        },
        where: {
            id: decodedId,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.PLAYER_GET_VOTE_FAIL);

    const encodedId = crypto.encodeVoteId(data.id);

    const resultDTO: PlayerPicturesGetDTO = {
        userName: data?.User.user_name as string,
        voteId: encodedId as string,
        voteStatus: data?.status as boolean,
        voteTitle: data?.title as string,
        Picture: data?.Picture as object[],
        type: data?.type as number,
    };

    if (resultDTO.voteStatus == false)
        throw new PicmeException(sc.BAD_REQUEST, false, rm.PLAYER_VOTE_ALREADY_END);

    return resultDTO;
};

const playerGetVotedResult = async (pictureId: number) => {
    const data = await prisma.picture.findUnique({
        select: {
            id: true,
            url: true,
            count: true,
            vote_id: true,
            Sticker: {
                select: {
                    sticker_location: true,
                    emoji: true,
                    count: true,
                },
            },
        },
        where: {
            id: pictureId,
        },
    });

    const voteType = await prisma.vote.findFirst({
        select: {
            type: true,
        },
        where: {
            id: data?.vote_id,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.PLAYER_GET_VOTE_FAIL);

    const resultDTO: PlayerGetVotedResultDTO = {
        Picture: {
            pictureId: data?.id,
            url: data.url,
            count: data.count,
        },
        Sticker: data.Sticker.map((value: any) => {
            let DTOs = {
                stickerLocation: value.sticker_location as string,
                emoji: value.emoji as number,
                count: value.count as number,
            };
            return DTOs;
        }),
        type: voteType?.type as number,
    };
    return resultDTO;
};

const voteService = {
    createVote,
    closeVote,
    playerGetPictures,
    findVoteById,
    deleteVote,
    getSingleVote,
    getCurrentSingleVote,
    playerGetVotedResult,
    getCurrentVotes,
    getVoteLibrary,
    getVoteReminder,
};

export default voteService;
