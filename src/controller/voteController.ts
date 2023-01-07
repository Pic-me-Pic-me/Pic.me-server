import { Request, Response } from "express";
import { authService, voteService } from "../service";
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


const deleteVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    //const refreshToken = req.body.refreshToken;
    //const user = await authService.findByRefreshToken(refreshToken);

    const userId = req.body.userId;
    if (!userId) return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_TOKEN));
    if (!voteId) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NOT_VOTE_ID));
    const vote = await voteService.findVoteById(userId, +voteId);
    if (!vote) return res.status(sc.NOT_FOUND).send(fail(sc.NOT_FOUND, rm.NOT_VOTE_ID));
    if (vote == sc.BAD_REQUEST) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.VOTE_USER_NOT_EQUAL));

    const result = await voteService.deleteVote(userId, +voteId);
    if (result == sc.OK) return res.status(sc.OK).send(success(sc.OK, rm.DELETE_VOTE_SUCCESS));
    return res.status(sc.DB_ERROR).send(fail(sc.DB_ERROR, rm.DELETE_USER_FAIL));
}

const getSingleVote = async (req: Request, res: Response) => {
    const { voteId } = req.params;
    const data = await voteService.getSingleVote(+voteId);

    if (!data) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.GET_VOTE_FAIL)); //여기
}
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
    deleteVote,
    getSingleVote,
    playerGetVotedResult,
    closeVote,
    getCurrentVotes,
};

export default voteController;
