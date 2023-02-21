import cookie, { CookieSerializeOptions } from "cookie";
import config from "../config";

const cookieOptions: CookieSerializeOptions = {
    sameSite: "none",
    domain: config.webDomain,
    path: "/",
};

const setRefreshTokenCookie = (cookieValue: string) => {
    return cookie.serialize("refreshToken", cookieValue, cookieOptions);
};

export default {
    setRefreshTokenCookie,
};
