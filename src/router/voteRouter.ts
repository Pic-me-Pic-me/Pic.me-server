import { Router } from "express";
import { voteController } from "../controller";
import { upload, auth } from "../middlewares";

const router: Router = Router();

router.get("/getCurrentVote/:cursorId", auth, voteController.getCurrentVotes); // auth 로직 필요??

router.post("/:userId", upload.array("file"), voteController.createVote);

router.delete("/:voteId", voteController.deleteVote);

router.get("/maker/singleResult/:voteId", auth, voteController.getSingleVote); //라우터 경로 추천좀

router.patch("/close/:voteId", auth, voteController.closeVote);

/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

router.get("/player/:pictureId", voteController.playerGetVotedResult); //라우터 추천좀

export default router;
