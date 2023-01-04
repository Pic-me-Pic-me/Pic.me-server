import { Router } from "express";
import voteRouter from "./voteRouter";
import authRouter from "./authRouter";

const router: Router = Router();

router.use("/vote", voteRouter);
router.use("/auth", authRouter);

export default router;