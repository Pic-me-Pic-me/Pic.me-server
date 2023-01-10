import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
import { SingleVoteGetDTO } from "./../interfaces/SingleVoteGetDTO";
import { PlayerGetVotedResultDTO } from "./../interfaces/PlayerGetVotedResultDTO";
import { CurrentVotesGetDTO } from "./../interfaces/CurrentVotesGetDTO";
import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { PrismaClient } from "@prisma/client";
import { sc } from "../constants";
import dayjs from "dayjs";

const prisma = new PrismaClient();

const refineVoteDate = async (voteData: object[]) => {
    voteData.map((value: any) => {
        if (value.Picture.length != 0) value["url"] = value.Picture[0].url;
        else value["url"] = "";

        value["createdAt"] = value.created_at;
        delete value.created_at;
        delete value.Picture;
    });

    return voteData;
};

const createVote = async (userId: number, voteDTO: VoteCreateDTO) => {
    const data = await prisma.vote.create({
        data: {
            user_id: userId,
            title: voteDTO.title,
            status: true,
            count: 0,
            created_at: dayjs().add(9, "hour").format(),
            date: +dayjs().format("YYYYMM"),
            Picture: {
                create: [
                    { url: voteDTO.pictures[0], count: 0 },
                    { url: voteDTO.pictures[1], count: 0 },
                ],
            },
        },
    });

    if (!data) return null;

    return data.id;
};

const closeVote = async (voteId: number, userId: number) => {
    const vote = await prisma.vote.findUnique({
        where: {
            id: voteId,
        },
    });

    if (!vote) return null;

    if (vote.user_id != userId) return sc.UNAUTHORIZED;

    if (!vote.status) return sc.BAD_REQUEST;

    const data = await prisma.vote.update({
        where: {
            id: voteId,
        },
        data: {
            status: false,
        },
    });

    if (!data) return null;

    return data.id;
};

const deleteVote = async (userId: number, voteId: number) => {
    await prisma.vote.delete({
        where: {
            id: voteId,
        },
    });
    return sc.OK;
};

const findVoteById = async (userId: number, voteId: number) => {
    const vote = await prisma.vote.findUnique({
        where: {
            id: voteId,
        },
    });
    if (!vote) return null;
    if (vote.user_id != userId) return sc.BAD_REQUEST;
    return vote;
};

const getSingleVote = async (voteId: number) => {
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
            },
        },
        where: {
            id: voteId,
        },
    });

    if (!data) return null;

    const resultDTO: SingleVoteGetDTO = {
        voteId: data?.id as number,
        voteStatus: data?.status as boolean,
        voteTitle: data?.title as string,
        currentVote: data?.count as number,
        createdDate: data?.created_at as Date,
        Picture: data?.Picture.map((value: any) => {
            let DTOs = {
                pictureId: value.id,
                url: value.url,
                count: value.count,
                Sticker: value.Sticker.map((sticker: any) => {
                    let stickerDTO = {
                        stickerLocation: sticker.sticker_location,
                        emoji: sticker.emoji,
                        count: sticker.count,
                    };
                    return stickerDTO;
                }),
            };
            return DTOs;
        }) as object[],
    };

    return resultDTO;
};

const getCurrentVotes = async (userId: number, cursorId: number) => {
    console.log(userId, cursorId);

    const isFirstPage = !cursorId;

    const pageCondition = {
        skip: 1,
        cursor: {
            id: cursorId as number,
        },
    };

    const data = await prisma.vote.findMany({
        select: {
            id: true,
            title: true,
            created_at: true,
            count: true,
            date: true,
            Picture: {
                select: {
                    url: true,
                },
                orderBy: {
                    count: "desc",
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
            voteId: value.id as number,
            title: value.title as string,
            voteThumbnail: value.Picture[0]?.url as string,
            createdAt: value.created_at as string,
            totalVoteCount: value.count as number,
        };
        return DTOs;
    });

    const resCursorId = data[data.length - 1].id;
    return { result, resCursorId };
};

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
    console.log(dates);
    if (dates.length == 0) return dates;

    if (flag == 0) {
        dates = dates.splice(0, 3);
    } else {
        const index = dates.findIndex((data) => data.date === flag);
        dates = dates.splice(index + 1, 3);
    }

    const result: object[] = await Promise.all(
        dates.map(async (value: any) => {
            const voteData = await prisma.vote.findMany({
                where: {
                    date: value.date as number,
                    user_id: userId,
                    status: false,
                },
                select: {
                    id: true,
                    title: true,
                    count: true,
                    created_at: true,
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
            });

            await refineVoteDate(voteData);

            return {
                date: value.date,
                votes: voteData,
            };
        })
    );

    return result;
};

const getVoteReaminder = async (userId: number, date: number, flag: number) => {
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
        skip: 1,
        cursor: { id: flag },
    });

    await refineVoteDate(voteData);

    return voteData;
};

/*
    플레이어
*/

const playerGetPictures = async (voteId: number) => {
    const data = await prisma.vote.findFirst({
        select: {
            id: true,
            status: true,
            title: true,
            Picture: {
                select: {
                    id: true,
                    url: true,
                },
            },
            User: {
                select: {
                    user_name: true,
                },
            },
        },
        where: {
            id: voteId,
        },
    });

    if (!data) return null;

    const resultDTO: PlayerPicturesGetDTO = {
        userName: data?.User.user_name as string,
        voteId: data?.id as number,
        voteStatus: data?.status as boolean,
        voteTitle: data?.title as string,
        Picture: data?.Picture as object[],
    };
    return resultDTO;
};

const playerGetVotedResult = async (pictureId: number) => {
    const data = await prisma.picture.findUnique({
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
        where: {
            id: pictureId,
        },
    });
    if (!data) return null;

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
    playerGetVotedResult,
    getCurrentVotes,
    getVoteLibrary,
    getVoteReaminder,
};

export default voteService;
