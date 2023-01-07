import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { sc } from "../constants";
import { StickerCreateDTO } from "../interfaces/StickerCreateDTO";

const prisma = new PrismaClient();

const findSticker = async (tx: Prisma.TransactionClient, pictureId: number, emoji: number) => {
    const sticker = await tx.sticker.findFirst({
        where: {
            emoji: emoji,
            picture_id: pictureId,
        },
    });

    return sticker;
};

const createSticker = async (
    tx: Prisma.TransactionClient,
    parsedLocation: string,
    pictureId: number,
    emoji: number,
    count: number
) => {
    const createdSticker = await tx.sticker.create({
        data: {
            sticker_location: parsedLocation,
            emoji: emoji,
            picture_id: pictureId,
            count: count,
        },
    });

    return createdSticker;
};

const updateSticker = async (
    tx: Prisma.TransactionClient,
    currentLocation: string,
    length: number,
    stickerId: number
) => {
    const updatedSticker = await tx.sticker.update({
        data: {
            sticker_location: currentLocation,
            count: {
                increment: length,
            },
        },
        where: {
            id: stickerId,
        },
    });
    return updatedSticker;
};

const stickerPaste = async (stickerCreateDto: StickerCreateDTO) => {
    const picture = await prisma.picture.findUnique({
        where: {
            id: stickerCreateDto.pictureId,
        },
    });

    if (!picture) return null;

    const length = stickerCreateDto.location.length;

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
                    stickerCreateDto.emoji,
                    length
                );
            } else {
                let parseCurrentLocation = JSON.parse(sticker.sticker_location as string);
                stickerCreateDto.location.map((value: object) => {
                    parseCurrentLocation.push(value);
                });
                parseCurrentLocation = JSON.stringify(parseCurrentLocation);

                modifiedSticker = await updateSticker(tx, parseCurrentLocation, length, sticker.id);
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
        console.log(e);
        return sc.BAD_REQUEST;
    }
};

const stickerService = {
    stickerPaste,
};

export default stickerService;
