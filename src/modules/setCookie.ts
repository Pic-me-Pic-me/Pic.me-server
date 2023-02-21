import cookie, { CookieSerializeOptions } from "cookie";

const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
};

const setRefreshTokenCookie = (cookieValue: string) => {
    return cookie.serialize("refreshToken", cookieValue, cookieOptions);
};

export default {
    setRefreshTokenCookie,
};
