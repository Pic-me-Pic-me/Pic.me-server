import { Router } from "express";
import { flowerController } from "../controller";
import { upload, auth } from "../middlewares";

const router: Router = Router();

// get single flower vote result in library
router.get("/library/:voteId", flowerController.getSingleFlowerVote);

// post flower vote
router.post("/", upload.single("file"), auth, flowerController.createVote);

/*
 플레이어
*/
// get current vote picture
router.get("/common/:voteId", flowerController.playerGetFlowerVotePicture);

export default router;
