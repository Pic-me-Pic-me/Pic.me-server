import { Router } from "express";
import { authController } from "../controller";
import { body } from "express-validator"

const router: Router = Router();

router.post(
    "/",
    [
        body("username").notEmpty(),
        body("email").notEmpty(), 
        body("email").isEmail(),
        body("password").isLength({ min: 10 })
    ],
    authController.createUser
);

router.post(
    "/signin",
    [
        body("email").notEmpty(),
        body("email").isEmail(),
        body("password").notEmpty(),
        body("password").isLength({ min: 10 }),
    ],
    authController.signInUser
);

router.post("/kakao", authController.getUser);

export default router;
