import { Router } from "express";
import { flowerController } from "../controller";
import { upload } from "../middlewares";
const router: Router = Router();

// get single flower vote result in library
router.get("/library/:voteId", flowerController.getSingleFlowerVote);

// post flower vote
router.post("/", upload.single("file"), flowerController.createVote);

export default router;
