import { Request, Response, NextFunction } from "express";
import { flowerService } from "../service";
import { rm, sc } from "../constants";
import { success } from "../constants/response";
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
    
    let locations: string[]= [];
    locations.push(images.location);
    
    if (locations.length != 1) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.NOT_ONE_PICTURE));
    }

    const voteDTO: VoteCreateDTO = {
        title: "",
        status: true,
        pictures: locations,
        count: 0,
        type: 2
    };

    try {
        const data = await flowerService.createVote(+userId, voteDTO);

        return res.status(sc.OK).send(success(sc.OK, rm.CREATE_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

const flowerController = {
    createVote
};

export default flowerController;
