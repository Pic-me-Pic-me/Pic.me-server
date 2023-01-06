import { Router } from "express";
import { voteController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

router.post("/:userId", upload.array("file"), voteController.createVote);
router.delete("/:voteId", voteController.deleteVote);
/*
    플레이어
*/

router.get("/:voteId", voteController.playerGetPictures);

export default router;
