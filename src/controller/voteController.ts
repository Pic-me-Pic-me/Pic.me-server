import { Request, Response } from "express";
import { authService, voteService } from "../service";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { VoteCreateDTO } from "../interfaces/VoteCreateDTO";
import crypto from "../modules/crypto";

const createVote = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const images: Express.MulterS3.File[] = req.files as Express.MulterS3.File[];

    const locations = images.map((image: Express.MulterS3.File) => {
        return image.location;
    });

    if (locations.length != 2) {
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NOT_TWO_PICTURES));
    }

    const voteDTO: VoteCreateDTO = {
        title: req.body.title,
        status: true,
        pictures: locations,
        count: 0,
    };

    const data = await voteService.createVote(+userId, voteDTO);
    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.CREATE_VOTE_FAIL));

    return res.status(sc.OK).send(success(sc.OK, rm.CREATE_VOTE_SUCCESS, data));
};

const deleteVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;

    const userId = req.body.userId;

    if (!userId) return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_TOKEN));

    if (!voteId) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NOT_VOTE_ID));

    const vote = await voteService.findVoteById(userId, voteId);

    if (!vote) return res.status(sc.NOT_FOUND).send(fail(sc.NOT_FOUND, rm.NOT_VOTE_ID));

    if (vote == sc.BAD_REQUEST)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.VOTE_USER_NOT_EQUAL));

    const result = await voteService.deleteVote(voteId);

    if (result == sc.BAD_REQUEST)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.TRANSACTION_FAILED));

    return res.status(sc.OK).send(success(sc.OK, rm.DELETE_VOTE_SUCCESS));
};

const getSingleVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    const data = await voteService.getSingleVote(voteId);

    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.GET_VOTE_FAIL)); //여기

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

const getCurrentSingleVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    const data = await voteService.getCurrentSingleVote(voteId);

    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.GET_VOTE_FAIL)); //여기

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

const getCurrentVotes = async (req: Request, res: Response) => {
    const { cursorId } = req.params;

    const data = await voteService.getCurrentVotes(+req.body.userId, +cursorId);

    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NO_CURRENT_VOTE));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

const getVoteLibrary = async (req: Request, res: Response) => {
    const { flag } = req.query;

    if (!flag) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));

    const data = await voteService.getVoteLibrary(req.body.userId, +flag);

    if (data.length == 0) return res.status(sc.OK).send(success(sc.OK, rm.LIBRARY_NO_DATA, data));
    else return res.status(sc.OK).send(success(sc.OK, rm.LIBRARY_GET_SUCCESS, data));
};

const getVoteReaminder = async (req: Request, res: Response) => {
    const { date, flag } = req.query;

    if (!date || !flag) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));

    const data = await voteService.getVoteReaminder(req.body.userId, +date, +flag);

    if (data.length == 0) return res.status(sc.OK).send(success(sc.OK, rm.INF_SCROLL_END, data));

    return res.status(sc.OK).send(success(sc.OK, rm.INF_SCROLL_SUCCESS, data));
};

/*
 [ 플레이어 ]
*/

const playerGetPictures = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    const data = await voteService.playerGetPictures(voteId);
    if (!data)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.PLAYER_GET_VOTE_FAIL));
    if (data.voteStatus == false)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.PLAYER_VOTE_ALREADY_END));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

const playerGetVotedResult = async (req: Request, res: Response) => {
    const { pictureId } = req.params;

    const data = await voteService.playerGetVotedResult(+pictureId);
    if (!data)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.PLAYER_GET_VOTE_FAIL));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTED_RESULT_SUCCESS, data));
};

const closeVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    const { userId } = req.body;

    const result = await voteService.closeVote(voteId, userId);
    if (!result) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.CLOSE_VOTE_FAIL));
    if (result == sc.UNAUTHORIZED)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.VOTE_NOT_ADMIN));
    if (result == sc.BAD_REQUEST)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.ALREADY_CLOSED_VOTE));

    return res.status(sc.OK).send(success(sc.OK, rm.CLOSE_VOTE_SUCCESS));
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
    getVoteReaminder,
};

export default voteController;
