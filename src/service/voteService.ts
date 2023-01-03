import { PictureCreateDTO } from './../interface/PictureCreateDTO';
import { VoteCreateDTO } from './../interface/VoteCreateDTO';
import {PrismaClient} from "@prisma/client";

const prisma=new PrismaClient();

const createVote= async(userId:number, voteDTO:VoteCreateDTO)=>{
    if(!userId)
        return null;
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

    await createPictures(+data.vote_id, voteDTO.pictures[0]);
    await createPictures(+data.vote_id, voteDTO.pictures[1]);
    
    return data;
};

const createPictures = async(voteId:number, pictureUrl:string) => {
    if(!voteId)
        return null;
    const data=await prisma.picture.create({
        data:{
            url:pictureUrl,
            count:0,
            vote_id:voteId
        }
    });
    return data.picture_id;
}

const voteService ={
    createVote
};

export default voteService;