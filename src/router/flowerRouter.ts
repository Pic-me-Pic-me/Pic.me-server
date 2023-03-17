import { Router } from "express";
import { flowerController } from "../controller";
import { upload } from "../middlewares";

const router: Router = Router();

// post flower vote
router.post("/", upload.single("file"), flowerController.createVote);

export default router;