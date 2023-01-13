import { Router } from "express";
import { voteController } from "../controller";
import { upload, auth } from "../middlewares";

const router: Router = Router();

router.post("/", upload.array("file"), auth, voteController.createVote);

router.get("/getCurrentVote/:cursorId", auth, voteController.getCurrentVotes); // auth 로직 필요??

router.delete("/:voteId", auth, voteController.deleteVote);

router.get("/maker/singleResult/:voteId", auth, voteController.getSingleVote); // 완료된 투표 결과 확인

router.get("/maker/currentSingleResult/:voteId", auth, voteController.getCurrentSingleVote); //현재 진행중인 투표의 결과 확인,

router.patch("/close/:voteId", auth, voteController.closeVote);

router.get("/all", auth, voteController.getVoteLibrary);

router.get("/left", auth, voteController.getVoteReaminder);

/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

router.get("/player/:pictureId", voteController.playerGetVotedResult); //라우터 추천좀

export default router;
