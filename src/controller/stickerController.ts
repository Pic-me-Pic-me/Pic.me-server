import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { stickerService } from "../service";
import { StickerCreateDTO } from "../interfaces/StickerCreateDTO";
import { FlowerStickerCreateDTO } from "../interfaces/FlowerStickerCreateDTO";

/**
 * paste sticker for specific picture of a vote
 *
 * @api {post} /sticker
 */
const stickerPaste = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    if (!error.isEmpty())
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));

    const StickerCreateDto: StickerCreateDTO = req.body;

    if (StickerCreateDto.location.length > 3)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.STICKER_COUNT_EXCEED));

    try {
        const data = await stickerService.stickerPaste(StickerCreateDto);
        return res.status(sc.OK).send(success(sc.OK, rm.CREATE_STICKER_SUCCESS, data));
    } catch (e) {
        next(e);
    }
};

const flowerStickerPaste = async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    if (!error.isEmpty())
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));

    const FlowerStickerCreateDto: FlowerStickerCreateDTO = req.body;

    if (FlowerStickerCreateDto.location.length > 1)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.STICKER_COUNT_EXCEED));

    try {
        const data = await stickerService.flowerStickerPaste(FlowerStickerCreateDto);
        return res.status(sc.OK).send(success(sc.OK, rm.CREATE_STICKER_SUCCESS, data));
    } catch (e) {
        next(e);
    }
};

const stickerController = {
    stickerPaste,
    flowerStickerPaste,
};

export default stickerController;
