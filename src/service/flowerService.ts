import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { PrismaClient } from "@prisma/client";
import { PicmeException } from "../models/PicmeException";
import crypto from "../modules/crypto";
import { sc, rm } from "../constants";
import dayjs from "dayjs";

const prisma = new PrismaClient();

/**
 * create vote with picture
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
                ],
            },
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.CREATE_VOTE_FAIL);

    return crypto.encodeVoteId(data.id);
};

const flowerService= {
    createVote
};

export default flowerService;