import { Router } from "express";
import { userController } from "../controller";
import { auth } from "../middlewares";

const router: Router = Router();

router.get("/", auth, userController.getUserInfo);

router.get("/name", userController.checkUserName);

router.delete("/", auth, userController.deleteUser);

export default router;
