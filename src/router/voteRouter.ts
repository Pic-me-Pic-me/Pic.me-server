import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

router.post("/", upload.array("file"), voteController.createVote);

router.get("/getCurrentVote/:cursorId", voteController.getCurrentVotes); // auth 로직 필요??

router.delete("/:voteId", voteController.deleteVote);

router.get("/maker/singleResult/:voteId", voteController.getSingleVote); // 완료된 투표 결과 확인

router.get("/maker/currentSingleResult/:voteId", voteController.getCurrentSingleVote); //현재 진행중인 투표의 결과 확인,

router.patch("/close/:voteId", voteController.closeVote);

router.get("/all", voteController.getVoteLibrary);

router.get("/left", voteController.getVoteReaminder);

/*
    플레이어
*/

router.get("/player/:voteId", voteController.playerGetPictures);

router.get("/player/:pictureId", voteController.playerGetVotedResult); //라우터 추천좀

export default router;
