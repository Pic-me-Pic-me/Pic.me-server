import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { flowerService } from "../service";
import { VoteCreateDTO } from "../interfaces/VoteCreateDTO";
import { PicmeException } from "../models/PicmeException";

/**
 * create vote
 *
 * @api {post} /flower
 */
const createVote = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    const images: Express.MulterS3.File = req.file as Express.MulterS3.File;

    if (!req.body.userId) return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));

    let locations: string[] = [];
    locations.push(images.location);

    if (locations.length != 1) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.NOT_ONE_PICTURE));
    }

    const voteDTO: VoteCreateDTO = {
        title: "",
        status: true,
        pictures: locations,
        count: 0,
        type: 2,
    };

    try {
        const data = await flowerService.createVote(+userId, voteDTO);

        return res.status(sc.OK).send(success(sc.OK, rm.CREATE_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

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
    createVote,
    getSingleFlowerVote,
    playerGetFlowerVotePicture,
};

export default flowerController;
