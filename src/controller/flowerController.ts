import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { flowerService } from "../service";

/**
 * get single flower vote result in library
 *
 * @api {get} /library/:voteId
 */
const getSingleFlowerVote = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;

    try {
        const data = await flowerService.getSingleVote(voteId);

        return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

/**
 * [Player] get flower vote Picture
 *
 * @api {get} /flower/common/:pictureId
 */
const playerGetFlowerVotePicture = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;

    try {
        const data = await flowerService.playerGetFlowerVotePicture(voteId);

        return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_PICTURE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

const flowerController = {
    getSingleFlowerVote,
    playerGetFlowerVotePicture,
};

export default flowerController;
