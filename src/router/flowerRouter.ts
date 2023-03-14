import { Router } from "express";
import { flowerController } from "../controller";

const router: Router = Router();

// get single flower vote result in library
router.get("/library/:voteId", flowerController.getSingleFlowerVote);

export default router;
