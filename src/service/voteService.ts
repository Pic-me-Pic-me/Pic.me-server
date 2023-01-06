import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
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
    closeVote,
    playerGetPictures,
};

export default voteService;
