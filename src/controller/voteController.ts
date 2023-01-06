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
    const refreshToken = req.body.refreshToken;
    const user = await authService.findByRefreshToken(refreshToken);
    if (!user) return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_TOKEN));
    if (!voteId) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NOT_VOTE_ID));
    const vote = await voteService.findVoteById(user.id, +voteId);
    if (!vote) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    if (vote == sc.BAD_REQUEST) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));

    await voteService.deleteVote(user.id, +voteId);
    return res.status(sc.OK).send(success(sc.OK, rm.DELETE_VOTE_SUCCESS));
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

const voteController = {
    createVote,
    playerGetPictures,
    deleteVote,
};

export default voteController;
