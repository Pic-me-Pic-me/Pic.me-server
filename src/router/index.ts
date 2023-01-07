import { Router } from "express";
import voteRouter from "./voteRouter";
import authRouter from "./authRouter";
import stickerRouter from "./stickerRouter";

const router: Router = Router();

router.use("/vote", voteRouter);
router.use("/auth", authRouter);
router.use("/sticker", stickerRouter);

export default router;
