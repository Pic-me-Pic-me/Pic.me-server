import { Request, Response } from "express";
import { voteService } from "../service";
import {VoteCreateDTO} from "../interface/VoteCreateDTO";

const createVote= async(req: Request, res:Response) => {
    const {userId}=req.params;
    const images : Express.MulterS3.File[] = req.files as Express.MulterS3.File[];
    
    const locations = images.map((image:Express.MulterS3.File) => {return image.location}); 
    const voteDTO:VoteCreateDTO={
        title:req.body.title,
        status:false,
        pictures:locations,
        count:0,
        max_count:(+req.body.max_count),
    };
    const data=await voteService.createVote(+userId, voteDTO);

    if(!data){
        res.status(404).send("데이터 없었다...");
    }
    res.status(200).send("성공");
}

const voteController = {
    createVote
};

export default voteController;