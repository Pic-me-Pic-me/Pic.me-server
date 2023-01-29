import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

// post vote
router.post("/", upload.array("file"), voteController.createVote);

// get current vote list
router.get("/list/:cursorId", voteController.getCurrentVotes);
// router.get("/getCurrentVote/:cursorId", voteController.getCurrentVotes);

// delete Vote
router.delete("/:voteId", voteController.deleteVote);

// get single vote result in library
router.get("/library/:voteId", voteController.getSingleVote); // 완료된 투표 결과 확인
// router.get("/maker/singleResult/:voteId", voteController.getSingleVote); // 완료된 투표 결과 확인

// get current single vote result
router.get("/:voteId", voteController.getCurrentSingleVote);
// router.get("/maker/currentSingleResult/:voteId", voteController.getCurrentSingleVote);

// close current
router.patch("/:voteId", voteController.closeVote);
// router.patch("/close/:voteId", voteController.closeVote);

// get library votes -> bottom infinite scroll
router.get("/library", voteController.getVoteLibrary);
// router.get("/all", voteController.getVoteLibrary);

// get single month library -> right infinite scroll
router.get("/library/month", voteController.getVoteReaminder);
// router.get("/left", voteController.getVoteReaminder);

/*
    플레이어
*/

// get current pictures in vote
router.get("/common/pictures/:voteId", voteController.playerGetPictures);
// router.get("/player/:voteId", voteController.playerGetPictures);

// get current vote status
router.get("/common/:pictureId", voteController.playerGetVotedResult);
// router.get("/player/:pictureId", voteController.playerGetVotedResult);

export default router;
