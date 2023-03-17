import { Router } from "express";
import { flowerController } from "../controller";

const router: Router = Router();

// get single flower vote result in library
router.get("/library/:voteId", flowerController.getSingleFlowerVote);

//용택리..위에 라우터 겹칠 것 같은데
// get current single flower vote
router.get("/flower/current/:voteId", flowerController.getCurrentFlowerVote);

// get current single flower vote result
router.get("/flower/result/:voteId", flowerController.getCurrentFlowerVoteResult);

/*
 플레이어
*/
// get current vote status
router.get("/flower/common/:pictureId", flowerController.playerGetFlowerVotedResult);

export default router;
