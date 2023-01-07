import { Router } from "express";
import { userController } from "../controller";
import { upload, auth } from "../middlewares";

const router: Router = Router();

router.get("/", auth, userController.getUserInfo);
router.get("/name", userController.checkUserName);

export default router;
