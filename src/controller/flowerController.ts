import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { flowerService } from "../service";

/**
 * get single flower vote result in library
 *
 * @api {get} /library/:voteId
 */
const getSingleFlowerVote = async (req: Request, res: Response, next: NextFunction) => {};

const flowerController = {
    getSingleFlowerVote,
};

export default flowerController;
