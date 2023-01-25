import { Router } from "express";
import { userController } from "../controller";

const router: Router = Router();

router.get("/", userController.getUserInfo);
router.get("/name", userController.checkUserName);
router.delete("/", userController.deleteUser);
export default router;
