import { Router } from "express";
import voteRouter from "./voteRouter";
import authRouter from "./authRouter";
import stickerRouter from "./stickerRouter";
import userRouter from "./userRouter";

const router: Router = Router();

router.use("/vote", voteRouter);
router.use("/auth", authRouter);
router.use("/sticker", stickerRouter);
router.use("/user", userRouter);

export default router;
