import { Router } from "express";
import voteRouter from "./voteRouter";
import authRouter from "./authRouter";
import stickerRouter from "./stickerRouter";
import userRouter from "./userRouter";
import flowerRouter from "./flowerRouter";
import alarmRouter from "./alarmRouter";

const router: Router = Router();

router.use("/vote", voteRouter);
router.use("/auth", authRouter);
router.use("/sticker", stickerRouter);
router.use("/user", userRouter);
router.use("/flower", flowerRouter);
router.use("/alarm", alarmRouter);

//error checking

export default router;
