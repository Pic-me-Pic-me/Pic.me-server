import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
import { SingleVoteGetDTO } from "./../interfaces/SingleVoteGetDTO";
import { PlayerGetVotedResultDTO } from "./../interfaces/PlayerGetVotedResultDTO";
import { CurrentVotesGetDTO } from "./../interfaces/CurrentVotesGetDTO";
import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { Picture, PrismaClient } from "@prisma/client";
import { sc } from "../constants";
import { rm } from "fs";
import { title } from "process";
import { stringMap } from "aws-sdk/clients/backup";

const prisma = new PrismaClient();

const createVote = async (userId: number, voteDTO: VoteCreateDTO) => {
    const data = await prisma.vote.create({
        data: {
            user_id: userId,
            title: voteDTO.title,
            status: voteDTO.status,
            count: voteDTO.count,
        },
    });
    if (!data) return null;

    if ((await createPictures(+data.id, voteDTO.pictures[0])) == null) return sc.BAD_REQUEST;
    if ((await createPictures(+data.id, voteDTO.pictures[0])) == null) return sc.BAD_REQUEST;
    return data;
};

const closeVote = async (voteId: number, userId: number) => {
    const vote = await prisma.vote.findUnique({
        where: {
            id: voteId,
        },
    });

    if (!vote) return null;

    if (vote.user_id != userId) return sc.UNAUTHORIZED;

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

const createPictures = async (voteId: number, pictureUrl: string) => {
    const data = await prisma.picture.create({
        data: {
            url: pictureUrl,
            count: 0,
            vote_id: voteId,
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


//페이징 처리 해야됨
const getCurrentVotes = async (userId: number) => {
    const data = await prisma.vote.findMany({
        select: {
            id: true,
            title: true,
            created_at: true,
            count: true,
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
    });
    console.log(typeof data[0]);
    console.log(data[0]);

    const result: CurrentVotesGetDTO[] = data.map((value: any) => {
        let DTOs = {
            voteId: value.id as number,
            title: value.title as string,
            voteThumbnail: value.Picture[0].url as string,
            createdAt: value.created_at as string,
            totalVoteCount: value.count as number,
        };
        return DTOs;
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
            },
        },
        where: {
            id: voteId,
        },
    });

    if (!data) return null;

    const resultDTO: PlayerPicturesGetDTO = {
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
};

export default voteService;
