import { Request, Response } from "express";
import { voteService } from "../service";
import {VoteCreateDTO} from "../interface/VoteCreateDTO";
import { rm , sc} from "../constants";
import {fail, success} from "../constants/response";

const createVote= async(req: Request, res:Response) => {
    const {userId}=req.params;
    const images : Express.MulterS3.File[] = req.files as Express.MulterS3.File[];
    
    const locations = images.map((image:Express.MulterS3.File) => {return image.location}); 
    const voteDTO:VoteCreateDTO={
        title:req.body.title,
        status:false,
        pictures:locations,
        count:0,
    };
    const data=await voteService.createVote(+userId, voteDTO);
    if(!data)
        return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.CREATE_VOTE_FAIL));
    if(data==sc.BAD_REQUEST)
        return res.status(sc.BAD_REQUEST).send(fail(sc.OK, rm.CREATE_PICTURE_FAIL));
    return res.status(sc.OK).send(success(sc.OK, rm.CREATE_VOTE_SUCCESS));
};

const voteController = {
    createVote
};

export default voteController;