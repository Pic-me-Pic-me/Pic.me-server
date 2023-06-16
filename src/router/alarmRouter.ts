import { Router } from "express";
import { alarmController } from "../controller";
import { body } from "express-validator";

const router: Router = Router();

//push notification
router.post(
    "/push",
    [body("userId").notEmpty(), body("title").notEmpty(), body("message").notEmpty()],
    alarmController.push
);

//register notification
router.post(
    "/register",
    [body("userId").notEmpty(), body("endpoint").notEmpty(), body("keys").notEmpty()],
    alarmController.register
);

export default router;
