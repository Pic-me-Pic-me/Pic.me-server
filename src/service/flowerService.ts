import { VoteCreateDTO } from "./../interfaces/VoteCreateDTO";
import { PrismaClient } from "@prisma/client";
import { PicmeException } from "../models/PicmeException";
import crypto from "../modules/crypto";
import { sc, rm } from "../constants";
import { SingleFlowerVoteGetDTO } from "../interfaces/SingleFlowerVoteGetDTO";
import { KeywordSetDTO } from "../interfaces/KeywordSetDTO";
import dayjs from "dayjs";
import { FlowerPlayerPictureGetDto } from "../interfaces/FlowerPlayerPictureGetDto";

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
                create: [{ url: voteDTO.pictures[0], count: 0 }],
            },
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.CREATE_VOTE_FAIL);

    return crypto.encodeVoteId(data.id);
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
                            Keyword: {
                                select: {
                                    keyword: true,
                                },
                                where: {
                                    type: 2,
                                },
                                orderBy: {
                                    count: "desc",
                                },
                            },
                        },
                        where: {
                            type: 2,
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

    const resultDTO: SingleFlowerVoteGetDTO = {
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

            let keywordSet: KeywordSetDTO[] = [];

            value.Sticker.map((sticker: any) => {
                const index = skeleton.findIndex((e) => e.emoji === sticker.emoji);
                if (index != -1) {
                    skeleton[index].stickerLocation = sticker.sticker_location;
                    skeleton[index].count = sticker.count;
                }

                sticker.Keyword.map((data: any) => {
                    keywordSet.push({
                        flower: sticker.emoji,
                        keyword: data.keyword,
                    });
                });
            });

            const maxObject = skeleton.reduce((prev, value) => {
                return prev.count >= value.count ? prev : value;
            });

            const flower = maxObject.emoji;

            const filtered = keywordSet.filter((word) => word.flower == flower);

            const keywords = filtered.map((data) => {
                return data.keyword;
            });

            let DTOs = {
                pictureId: value.id,
                url: value.url,
                count: value.count,
                Sticker: skeleton,
                flower: flower,
                keywords: keywords,
            };

            return DTOs;
        }) as object[],
    };

    return resultDTO;
};

/**
 * get flower vote picture
 *
 * @param {string} voteId hashed vote id
 */
const playerGetFlowerVotePicture = async (voteId: string) => {
    const decodedId = +crypto.decodeVoteId(voteId);

    const data = await prisma.vote.findFirst({
        select: {
            id: true,
            status: true,
            Picture: {
                select: {
                    id: true,
                    url: true,
                },
            },
        },
        where: {
            id: decodedId,
        },
    });

    if (!data) throw new PicmeException(sc.BAD_REQUEST, false, rm.PLAYER_GET_VOTE_PICTURE_FAIL);

    const encodedId = crypto.encodeVoteId(data.id);

    const resultDTO: FlowerPlayerPictureGetDto = {
        voteId: encodedId as string,
        voteStatus: data.status as boolean,
        Picture: data.Picture as object,
    };

    if (resultDTO.voteStatus == false)
        throw new PicmeException(sc.BAD_REQUEST, false, rm.PLAYER_VOTE_ALREADY_END);

    return resultDTO;
};

const flowerService = {
    createVote,
    getSingleVote,
    playerGetFlowerVotePicture,
};

export default flowerService;
