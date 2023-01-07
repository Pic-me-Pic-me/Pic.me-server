import { Request, Response } from "express";
import { voteService } from "../service";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { VoteCreateDTO } from "../interfaces/VoteCreateDTO";

const createVote = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const images: Express.MulterS3.File[] = req.files as Express.MulterS3.File[];

    const locations = images.map((image: Express.MulterS3.File) => {
        return image.location;
    });
    const voteDTO: VoteCreateDTO = {
        title: req.body.title,
        status: false,
        pictures: locations,
        count: 0,
    };

    const data = await voteService.createVote(+userId, voteDTO);
    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.CREATE_VOTE_FAIL));
    if (data == sc.BAD_REQUEST) return res.status(sc.BAD_REQUEST).send(fail(sc.OK, rm.CREATE_PICTURE_FAIL));
    return res.status(sc.OK).send(success(sc.OK, rm.CREATE_VOTE_SUCCESS));
};

const getCurrentVotes = async (req: Request, res: Response) => {
    const { userId } = req.params;
    // const { userId } = req.body.uerId; //이게 맞음

    const data = await voteService.getCurrentVotes(+userId);
    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NO_CURRENT_VOTE));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

/*
 [ 플레이어 ]
*/

const playerGetPictures = async (req: Request, res: Response) => {
    const { voteId } = req.params;

    const data = await voteService.playerGetPictures(+voteId);
    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.PLAYER_GET_VOTE_FAIL));
    if (data.voteStatus == false) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.PLAYER_VOTE_ALREADY_END));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTE_SUCCESS, data));
};

const playerGetVotedResult = async (req: Request, res: Response) => {
    const { pictureId } = req.params;

    const data = await voteService.playerGetVotedResult(+pictureId);
    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.PLAYER_GET_VOTE_FAIL));

    return res.status(sc.OK).send(success(sc.OK, rm.PLAYER_GET_VOTED_RESULT_SUCCESS, data));
}

const closeVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    const { userId } = req.body;

    const result = await voteService.closeVote(+voteId, userId);
    if (!result) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.CLOSE_VOTE_FAIL));
    if (result == sc.UNAUTHORIZED) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.VOTE_NOT_ADMIN));

    return res.status(sc.OK).send(success(sc.OK, rm.CLOSE_VOTE_SUCCESS));
};

const voteController = {
    createVote,
    playerGetPictures,
    playerGetVotedResult,
    closeVote,
    getCurrentVotes,
};

export default voteController;
