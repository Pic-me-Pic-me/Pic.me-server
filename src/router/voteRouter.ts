import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

router.post("/:userId", upload.array("file"), voteController.createVote);

/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

export default router;
