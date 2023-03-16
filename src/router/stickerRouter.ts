import { Router } from "express";
import { stickerController } from "../controller";
import { body } from "express-validator";

const router: Router = Router();

// paste sticker
router.post(
    "/",
    [body("emoji").notEmpty(), body("pictureId").notEmpty(), body("location").notEmpty()],
    stickerController.stickerPaste
);

router.post(
    "/flower",
    [
        body("emoji").notEmpty(),
        body("keyword").notEmpty(),
        body("pictureId").notEmpty(),
        body("location").notEmpty(),
    ],
    stickerController.flowerStickerPaste
);
export default router;
