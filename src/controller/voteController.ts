import { Request, Response, NextFunction } from "express";
import { voteService } from "../service";
import { rm, sc } from "../constants";
import { success, failWithData } from "../constants/response";
import { VoteCreateDTO } from "../interfaces/VoteCreateDTO";
import { ClosedVoteResponseDTO } from "../interfaces/ClosedVoteResponseDTO";
import { LibraryDTO } from "../interfaces/LibraryDTO";
import { PicmeException } from "../models/PicmeException";

/**
 * create vote
 *
 * @api {post} /vote
 */
const createVote = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    const images: Express.MulterS3.File[] = req.files as Express.MulterS3.File[];

    if (!req.body.title || !req.body.userId)
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.BAD_REQUEST));

    const locations = images.map((image: Express.MulterS3.File) => {
        return image.location;
    });

    if (locations.length != 2) {
        return next(new PicmeException(sc.BAD_REQUEST, false, rm.NOT_TWO_PICTURES));
    }

    const voteDTO: VoteCreateDTO = {
        title: req.body.title,
        status: true,
        pictures: locations,
        count: 0,
        type: 1,
    };

    try {
        const data = await voteService.createVote(+userId, voteDTO);

        return res.status(sc.OK).send(success(sc.OK, rm.CREATE_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

/**
 * delete vote from user
 *
 * @api {delete} /vote/:voteId
 */
const deleteVote = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;

    const userId = req.body.userId;

    if (!userId) return next(new PicmeException(sc.UNAUTHORIZED, false, rm.INVALID_TOKEN));

    if (!voteId) return next(new PicmeException(sc.BAD_REQUEST, false, rm.NOT_VOTE_ID));

    try {
        await voteService.findVoteById(userId, voteId);

        await voteService.deleteVote(voteId);

        return res.status(sc.OK).send(success(sc.OK, rm.DELETE_VOTE_SUCCESS));
    } catch (e) {
        return next(e);
    }
};

/**
 * get single vote result in library
 *
 * @api {get} /library/:voteId
 */
const getSingleVote = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;

    try {
        const data = await voteService.getSingleVote(voteId);

        return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

/**
 * get current single vote result
 *
 * @api {get} /:voteId
 */
const getCurrentSingleVote = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;

    try {
        const data = await voteService.getCurrentSingleVote(voteId);

        return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

/**
 * get current vote list in main
 *
 * @api {get} /list/:cursorId
 */
const getCurrentVotes = async (req: Request, res: Response) => {
    const { cursorId } = req.params;

    const data = await voteService.getCurrentVotes(+req.body.userId, cursorId);

    if (!data) return res.status(sc.OK).send(success(sc.OK, rm.CURRENT_DATA_END, []));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

/**
 * get library votes - bottom infinite scroll
 *
 * @api {get} /library/scroll/all
 */
const getVoteLibrary = async (req: Request, res: Response, next: NextFunction) => {
    const { flag } = req.query;

    if (!flag) return next(new PicmeException(sc.BAD_REQUEST, false, rm.NULL_VALUE));

    const data = await voteService.getVoteLibrary(req.body.userId, +flag);

    const libraryDTO: LibraryDTO = {
        dates: data,
    };

    if (data.length == 0)
        return res.status(sc.OK).send(success(sc.OK, rm.LIBRARY_NO_DATA, libraryDTO));
    else return res.status(sc.OK).send(success(sc.OK, rm.LIBRARY_GET_SUCCESS, libraryDTO));
};

/**
 * get library votes - right infinite scroll
 *
 * @api {get} /library/scroll/month
 */
const getVoteReminder = async (req: Request, res: Response, next: NextFunction) => {
    const { date, flag } = req.query;

    if (!date || !flag) return next(new PicmeException(sc.BAD_REQUEST, false, rm.NULL_VALUE));

    const data = await voteService.getVoteReminder(req.body.userId, +date, flag as string);

    if (data.length == 0) return res.status(sc.OK).send(success(sc.OK, rm.INF_SCROLL_END, data));

    return res.status(sc.OK).send(success(sc.OK, rm.INF_SCROLL_SUCCESS, data));
};

/**
 * close current vote
 *
 * @api {patch} /:voteId
 */
const closeVote = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;
    const { userId } = req.body;

    try {
        await voteService.closeVote(voteId, userId);

        return res.status(sc.OK).send(success(sc.OK, rm.CLOSE_VOTE_SUCCESS));
    } catch (e) {
        return next(e);
    }
};

/*
   player
*/

/**
 * get current pictures in vote
 *
 * @api {get} /common/pictures/:voteId
 */
const playerGetPictures = async (req: Request, res: Response, next: NextFunction) => {
    const { voteId } = req.params;

    try {
        const data = await voteService.playerGetPictures(voteId);

        if (!data.voteStatus) {
            const closedVoteResponseDTO: ClosedVoteResponseDTO = {
                type: data.type,
                voteTitle: data.voteTitle,
            };

            return res
                .status(sc.BAD_REQUEST)
                .send(
                    failWithData(sc.BAD_REQUEST, rm.PLAYER_VOTE_ALREADY_END, closedVoteResponseDTO)
                );
        }

        return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

/**
 *  get current vote status
 *
 * @api {get} /common/:pictureId
 */
const playerGetVotedResult = async (req: Request, res: Response, next: NextFunction) => {
    const { pictureId } = req.params;

    try {
        const data = await voteService.playerGetVotedResult(+pictureId);

        return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTED_RESULT_SUCCESS, data));
    } catch (e) {
        return next(e);
    }
};

const voteController = {
    createVote,
    playerGetPictures,
    deleteVote,
    getSingleVote,
    getCurrentSingleVote,
    getVoteLibrary,
    playerGetVotedResult,
    closeVote,
    getCurrentVotes,
    getVoteReminder,
};

export default voteController;
