import { CookieSerializeOptions } from "cookie";
import config from "../config";

const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: config.webDomain,
};

export default {
    cookieOptions,
};
