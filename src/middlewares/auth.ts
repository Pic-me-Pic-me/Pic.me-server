import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { rm, sc } from "../constants";
import { fail } from "../constants/response";
import tokenType from "../constants/tokenType";
import jwtHandler from "../modules/jwtHandler";

export default async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ").reverse()[0];
    if (!token) return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.EMPTY_TOKEN));

    try {
        const decoded = jwtHandler.verify(token);

        if (decoded === tokenType.TOKEN_EXPIRED)
            return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.EXPIRED_TOKEN));
        if (decoded === tokenType.TOKEN_INVALID)
            return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.INVALID_TOKEN));

        const userId: number = (decoded as JwtPayload).userId;
        if (!userId) return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.INVALID_TOKEN));

        req.body.userId = userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(sc.INTERNAL_SERVER_ERROR).send(
            fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR)
        );
    }
};
