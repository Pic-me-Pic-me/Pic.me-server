import { SocialUser } from './../interfaces/SocialUser';
import axios from "axios";
import jwt from "jsonwebtoken";
import {rm} from "../constants"

export default async(kakaoAccessToken: string) => {
    try{
        const user=await axios({
            method:"get",
            url:"https://kapi.kakao.com/v2/user/me",
            headers:{
                Authorization: `Bearer ${kakaoAccessToken}`
            },
        });

        const userId=user.data.id;
        if(!userId)
            return rm.NO_SOCIAL_USER;

        let email="";
        
        if(user.data.kakao_account.email){
            email=user.data.kakao_account.email;
        }
        const kakaoUser: SocialUser = {
            userId:userId,
            email:email,
            providerType:"kakao"
        }
        return kakaoUser;
    }catch(error){

        return null;
    }
};
