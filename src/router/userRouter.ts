import { Router } from "express";
import { userController } from "../controller";

const router: Router = Router();

// get user's profile info
router.get("/", userController.getUserInfo);

// check duplicate nickname
router.get("/name", userController.checkUserName);

// check duplicate email
router.get("/email", userController.checkEmail);

// withdraw from picme
router.delete("/", userController.deleteUser);

export default router;
