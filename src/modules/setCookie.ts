import cookie, { CookieSerializeOptions } from "cookie";
import config from "../config";

const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: config.webURL,
};

const setRefreshTokenCookie = (cookieValue: string) => {
    return cookie.serialize("refreshToken", cookieValue, cookieOptions);
};

export default {
    setRefreshTokenCookie,
};
