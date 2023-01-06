import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
import { SingleVoteGetDTO } from "./../interfaces/SingleVoteGetDTO";
import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { Picture, PrismaClient } from "@prisma/client";
import { sc } from "../constants";

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

const voteService = {
    createVote,
    playerGetPictures,
    getSingleVote,
};

export default voteService;
