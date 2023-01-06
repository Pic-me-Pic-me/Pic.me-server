import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

router.post("/:userId", upload.array("file"), voteController.createVote);

/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

router.get("/player/:pictureId", voteController.playerGetVotedResult); //라우터 추천좀
export default router;
