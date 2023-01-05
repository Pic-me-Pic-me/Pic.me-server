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
    currentCount: number,
    stickerId: number
) => {
    const updatedSticker = await tx.sticker.update({
        data: {
            sticker_location: currentLocation,
            count: currentCount,
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

            if (!sticker) {
                const parsedLocation = JSON.stringify(stickerCreateDto.location);

                const createdSticker = await createSticker(
                    tx,
                    parsedLocation,
                    stickerCreateDto.pictureId,
                    stickerCreateDto.emoji,
                    length
                );

                return createdSticker;
            } else {
                let parseCurrentLocation = JSON.parse(sticker.sticker_location as string);
                let currentCount = sticker.count! + length;
                stickerCreateDto.location.map((value: object) => {
                    parseCurrentLocation.push(value);
                });
                parseCurrentLocation = JSON.stringify(parseCurrentLocation);

                const updatedSticker = await updateSticker(
                    tx,
                    parseCurrentLocation,
                    currentCount,
                    sticker.id
                );

                return updatedSticker.id;
            }
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
