import { Router } from "express";
import { authController } from "../controller";
import { body } from "express-validator";

const router: Router = Router();

//sign up with pic.me
router.post(
    "/",
    [
        body("username").notEmpty(),
        body("email").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 8 }),
    ],
    authController.createUser
);

//sign in with pic.me
router.post(
    "/signin",
    [
        body("email").notEmpty(),
        body("email").isEmail(),
        body("password").notEmpty(),
        body("password").isLength({ min: 8 }),
    ],
    authController.signInUser
);

// refresh accessToken
router.post(
    "/token",
    [body("refreshToken").notEmpty(), body("accessToken").notEmpty()],
    authController.tokenRefresh
);

// check kakao user
router.post(
    "/kakao/check",
    [body("socialType").notEmpty(), body("token").notEmpty()],
    authController.findSocialUser
);

// sign up with kakao
router.post(
    "/kakao",
    [
        body("uid").notEmpty(),
        body("socialType").notEmpty(),
        body("userName").notEmpty(),
        body("email"),
    ],
    authController.createSocialUser
);

// sign in with kakao
router.post(
    "/kakao/signin",
    [body("uid").notEmpty(), body("socialType").notEmpty()],
    authController.loginSocialUser
);

export default router;
