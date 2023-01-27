import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
import { SingleVoteGetDTO } from "./../interfaces/SingleVoteGetDTO";
import { PlayerGetVotedResultDTO } from "./../interfaces/PlayerGetVotedResultDTO";
import { CurrentVotesGetDTO } from "./../interfaces/CurrentVotesGetDTO";
import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { GetAllLibraryResultDTO } from "../interfaces/GetAllLibraryResultDTO";
import { ObjectIdentifier } from "../interfaces/ObjectIdentifier";
import { PrismaClient } from "@prisma/client";
import { sc } from "../constants";
import dayjs from "dayjs";
import s3Remover from "../modules/s3Remover";

const prisma = new PrismaClient();

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

const deleteVote = async (voteId: number) => {
    try {
        await prisma.$transaction(async (tx) => {
            const pictures = await tx.picture.findMany({
                where: {
                    vote_id: voteId,
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
                    id: voteId,
                },
            });
        });
    } catch (error) {
        console.log(error);
        return sc.BAD_REQUEST;
    }

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
                orderBy: {
                    count: "desc",
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

const getCurrentSingleVote = async (voteId: number) => {
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

const getCurrentVotes = async (userId: number, cursorId: number) => {
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

    if (dates.length == 0) return dates;

    if (flag == 0) {
        dates = dates.splice(0, 3);
    } else {
        const index = dates.findIndex((data) => data.date === flag);
        if (index == -1) return [];
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

            const resultDTO: GetAllLibraryResultDTO = {
                date: value.date as number,
                votes: voteData.map((value: any) => {
                    let votesDTO = {
                        id: value.id,
                        title: value.title,
                        count: value.count,
                        url: value.Picture[0].url,
                        createdAt: value.created_at,
                    };
                    return votesDTO;
                }),
            };

            return resultDTO;
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

    const result = voteData.map((value: any) => {
        let votesDTO = {
            id: value.id,
            title: value.title,
            count: value.count,
            url: value.Picture[0].url,
            createdAt: value.created_at,
        };
        return votesDTO;
    });

    return result;
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
    getCurrentSingleVote,
    playerGetVotedResult,
    getCurrentVotes,
    getVoteLibrary,
    getVoteReaminder,
};

export default voteService;
