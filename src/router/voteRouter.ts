import {Router} from "express";
import {voteController} from "../controller";
import {upload} from "../middleware";

const router: Router=Router();

router.post("/:userId", upload.array("file"), voteController.createVote);

export default router;