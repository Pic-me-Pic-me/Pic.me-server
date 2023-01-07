import { PlayerPicturesGetDTO } from "./../interfaces/PlayerPicturesGetDTO";
import { SingleVoteGetDTO } from "./../interfaces/SingleVoteGetDTO";
import { PlayerGetVotedResultDTO } from "./../interfaces/PlayerGetVotedResultDTO";
import { CurrentVotesGetDTO } from "./../interfaces/CurrentVotesGetDTO";
import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { Picture, PrismaClient } from "@prisma/client";
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

const userService = {
    getUserInfo,
};

export default userService;
