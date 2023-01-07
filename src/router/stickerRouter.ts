import { Router } from "express";
import { stickerController } from "../controller";
import { body } from "express-validator";

const router: Router = Router();

router.post(
    "/",
    [body("emoji").notEmpty(), body("pictureId").notEmpty(), body("location").notEmpty()],
    stickerController.stickerPaste
);

export default router;
