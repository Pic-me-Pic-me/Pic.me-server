import jwt from "jsonwebtoken";
import config from "../config";
import { tokenType } from "../constants";

const sign = (userId: number) => {
    const payload = {
        userId,
    };

    const accessToken = jwt.sign(payload, config.jwtSecretKey, { expiresIn: "3m" });
    return accessToken;
};

const signRefresh = (userId: number) => {
    const payload = {
        userId,
    };

    const refreshToken = jwt.sign(payload, config.jwtSecretKey, { expiresIn: "4m" });
    return refreshToken;
};

const verify = (token: string) => {
    let decoded: string | jwt.JwtPayload;

    try {
        decoded = jwt.verify(token, config.jwtSecretKey);
    } catch (error: any) {
        if (error.message === "jwt expired") {
            return tokenType.TOKEN_EXPIRED;
        } else if (error.message === "invalid token") {
            return tokenType.TOKEN_INVALID;
        } else {
            return tokenType.TOKEN_INVALID;
        }
    }

    return decoded;
};

export default {
    sign,
    signRefresh,
    verify,
};
