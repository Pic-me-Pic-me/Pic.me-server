import { Router } from "express";
import { authController } from "../controller";
import { body } from "express-validator";

const router: Router = Router();

router.post(
    "/",
    [
        body("username").notEmpty(),
        body("email").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 10 }),
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

router.post("/token", authController.tokenRefresh);
router.post("/kakao", authController.createSocialUser); // 회원가입
router.post("/kakao/check", authController.findSocialUser); // 카카오에 존재하는지
router.post("/kakao/signin", authController.loginSocialUser); //로그인

export default router;
