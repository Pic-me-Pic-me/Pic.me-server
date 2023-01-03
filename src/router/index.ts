import { Router } from "express";
import voteRouter from "./voteRouter";

const router: Router = Router();

router.use("/vote", voteRouter);

export default router;
