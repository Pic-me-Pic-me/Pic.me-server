import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { rm, sc } from "../constants";
import { StickerCreateDTO } from "../interfaces/StickerCreateDTO";
import { PicmeException } from "../models/PicmeException";

const prisma = new PrismaClient();

/**
 * find sticker by emoji, pictureId
 *
 * @param {Prisma.TransactionClient} tx prisma transaction client
 * @param {number} pictureId picture unique id
 * @param {number} emoji number of sticker emoji(1,2,3,4)
 */
const findSticker = async (tx: Prisma.TransactionClient, pictureId: number, emoji: number) => {
    const sticker = await tx.sticker.findFirst({
        where: {
            emoji: emoji,
            picture_id: pictureId,
        },
    });

    return sticker;
};

/**
 * create sticker dataSet
 *
 * @param {Prisma.TransactionClient} tx prisma transaction client
 * @param {string} parsedLocation parsed object array to string
 * @param {number} pictureId picture unique id
 * @param {number} emoji number of sticker emoji(1,2,3,4)
 */
const createSticker = async (
    tx: Prisma.TransactionClient,
    parsedLocation: string,
    pictureId: number,
    emoji: number
) => {
    const createdSticker = await tx.sticker.create({
        data: {
            sticker_location: parsedLocation,
            emoji: emoji,
            picture_id: pictureId,
            count: 1,
        },
    });

    return createdSticker;
};

/**
 * update sticker dataSet if exists
 *
 * @param {Prisma.TransactionClient} tx prisma transaction client
 * @param {string} currentLocation updated and parsed object array to string
 * @param {number} stickerId sticker unique id
 */
const updateSticker = async (
    tx: Prisma.TransactionClient,
    currentLocation: string,
    stickerId: number
) => {
    const updatedSticker = await tx.sticker.update({
        data: {
            sticker_location: currentLocation,
            count: {
                increment: 1,
            },
        },
        where: {
            id: stickerId,
        },
    });
    return updatedSticker;
};

/**
 * paste sticker for specific picture of a vote
 *
 * @param {StickerCreateDTO} stickerCreateDto  DTO for creating sticker
 */
const stickerPaste = async (stickerCreateDto: StickerCreateDTO) => {
    const picture = await prisma.picture.findUnique({
        where: {
            id: stickerCreateDto.pictureId,
        },
    });

    if (!picture) throw new PicmeException(sc.BAD_REQUEST, false, rm.PICTURE_NOT_EXIST);

    try {
        const data = await prisma.$transaction(async (tx) => {
            const sticker = await findSticker(
                tx,
                stickerCreateDto.pictureId,
                stickerCreateDto.emoji
            );

            let modifiedSticker;
            if (!sticker) {
                const parsedLocation = JSON.stringify(stickerCreateDto.location);

                modifiedSticker = await createSticker(
                    tx,
                    parsedLocation,
                    stickerCreateDto.pictureId,
                    stickerCreateDto.emoji
                );
            } else {
                let parsedCurrentLocation = JSON.parse(sticker.sticker_location as string);

                stickerCreateDto.location.map((value: object) => {
                    parsedCurrentLocation.push(value);
                });

                let currentLocation = JSON.stringify(parsedCurrentLocation);

                modifiedSticker = await updateSticker(tx, currentLocation, sticker.id);
            }

            const picture = await tx.picture.update({
                where: { id: modifiedSticker.picture_id },
                data: {
                    count: {
                        increment: 1,
                    },
                },
            });

            await tx.vote.update({
                where: { id: picture.vote_id },
                data: {
                    count: {
                        increment: 1,
                    },
                },
            });

            return modifiedSticker.id;
        });

        return data;
    } catch (e) {
        throw new PicmeException(sc.BAD_REQUEST, false, rm.STICKER_TRANSCTION_FAIL);
    }
};

const stickerService = {
    stickerPaste,
};

export default stickerService;
