import { Router } from "express";
import { voteController } from "../controller";
import { upload, auth } from "../middlewares";

const router: Router = Router();

// post vote
router.post("/", auth, upload.array("file"), voteController.createVote);

// get current vote list
router.get("/list/:cursorId", voteController.getCurrentVotes);

// delete Vote
router.delete("/:voteId", voteController.deleteVote);

// get single vote result in library
router.get("/library/:voteId", voteController.getSingleVote);

// get current single vote result
router.get("/:voteId", voteController.getCurrentSingleVote);

// close current vote
router.patch("/:voteId", voteController.closeVote);

// get library votes -> bottom infinite scroll
router.get("/library/scroll/all", voteController.getVoteLibrary);

// get single month library -> right infinite scroll
router.get("/library/scroll/month", voteController.getVoteReminder);

/*
    플레이어
*/

// get current pictures in vote
router.get("/common/pictures/:voteId", voteController.playerGetPictures);

// get current vote status
router.get("/common/:pictureId", voteController.playerGetVotedResult);

export default router;
