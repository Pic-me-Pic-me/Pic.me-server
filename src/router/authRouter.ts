import { Router } from "express";
import { authController } from "../controller";
import { body } from "express-validator"

const router: Router = Router();

router.post(
    "/",
    [body("username").notEmpty(), body("email").notEmpty(), body("password").isLength({ min: 6 })],
    authController.createUser
);

export default router;
