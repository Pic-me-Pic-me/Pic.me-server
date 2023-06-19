import { Router } from "express";
import { alarmController } from "../controller";
import { body } from "express-validator";

const router: Router = Router();

//push notification
router.post(
    "/push",
    [body("userList").notEmpty(), body("title").notEmpty(), body("message").notEmpty()],
    alarmController.push
);

//register notification
router.post(
    "/register",
    [body("endpoint").notEmpty(), body("expirationTime"), body("keys").notEmpty()],
    alarmController.register
);

export default router;
