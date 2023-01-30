import CryptoJS from "crypto-js";
import config from "../config";

const encodeVoteId = (voteId: number) => {
    const encodedId = CryptoJS.AES.encrypt(voteId.toString(), config.cryptoKey).toString();
    return encodeURIComponent(encodedId.toString());
};

const decodeVoteId = (encodedId: string) => {
    const decodedId = decodeURIComponent(encodedId);
    const voteId = CryptoJS.AES.decrypt(decodedId, config.cryptoKey).toString(CryptoJS.enc.Utf8);
    return voteId;
};

export default {
    encodeVoteId,
    decodeVoteId,
};
