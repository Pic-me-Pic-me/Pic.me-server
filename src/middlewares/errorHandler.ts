import { Request, Response, NextFunction } from "express";
import { PicmeException } from "../models/PicmeException";
import { sc } from "../constants";
import { fail } from "../constants/response";

const errorHandler = (
    error: TypeError | PicmeException,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof PicmeException) {
        console.log(`PicmeException: [${error.status}] ${error.message}`);
        console.log(error.stack?.split("\n")[1]);

        return res.status(error.status).send(fail(error.status, error.message));
    }

    console.error(error);
    return res.status(500).send("서버 내부 오류입니다.");
};

export default errorHandler;
