import { PictureCreateDTO } from './../interface/PictureCreateDTO';
import { VoteCreateDTO } from './../interface/VoteCreateDTO';
import {PrismaClient} from "@prisma/client";
import { sc } from '../constants';

const prisma=new PrismaClient();

const createVote= async(userId:number, voteDTO:VoteCreateDTO)=>{
    const data=await prisma.vote.create({
        data:{
            user_id:userId,
            title:voteDTO.title,
            status:voteDTO.status,
            count:voteDTO.count,
        }
    });
    if(!data)
        return null;

    if(await createPictures(+data.id, voteDTO.pictures[0])==null)
        return sc.BAD_REQUEST;
    if(await createPictures(+data.id, voteDTO.pictures[0])==null)
        return sc.BAD_REQUEST;
    return data;
};

const createPictures = async(voteId:number, pictureUrl:string) => {
    const data=await prisma.picture.create({
        data:{
            url:pictureUrl,
            count:0,
            vote_id:voteId
        }
    });
    if(!data)
        return null;
    return data.id;
};

const voteService ={
    createVote
};

export default voteService;