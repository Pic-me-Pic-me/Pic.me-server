import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

router.post("/:userId", upload.array("file"), voteController.createVote);

router.get("/getCurrentVote/:userId", voteController.getCurrentVotes); //userId + auth 로직 필요??
//라우팅 경로 고려
/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

export default router;
