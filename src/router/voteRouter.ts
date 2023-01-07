import { Router } from "express";
import { voteController } from "../controller";
import { upload, auth } from "../middlewares";

const router: Router = Router();

router.post("/:userId", upload.array("file"), voteController.createVote);

router.delete("/:voteId", voteController.deleteVote);

router.get("/maker/singleResult/:voteId", voteController.getSingleVote); //라우터 경로 추천좀

router.patch("/close/:voteId", auth, voteController.closeVote);

router.get("/all", auth, voteController.getVoteLibrary);

router.get("/left", auth, voteController.getVoteReaminder);

router.get("/getCurrentVote/:userId", voteController.getCurrentVotes); //userId + auth 로직 필요??
//라우팅 경로 고려

/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

router.get("/player/:pictureId", voteController.playerGetVotedResult); //라우터 추천좀
export default router;
