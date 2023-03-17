import { Router } from "express";
import { flowerController } from "../controller";

const router: Router = Router();

// get single flower vote result in library
router.get("/library/:voteId", flowerController.getSingleFlowerVote);

/*
 플레이어
*/
// get current vote picture
router.get("/common/:voteId", flowerController.playerGetFlowerVotePicture);

export default router;
