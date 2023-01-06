import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

router.post("/:userId", upload.array("file"), voteController.createVote);

router.get("/maker/singleResult/:voteId", voteController.getSingleVote); //라우터 경로 추천좀
/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

export default router;
