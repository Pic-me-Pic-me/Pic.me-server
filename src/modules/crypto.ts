import CryptoJS from "crypto-js";
const privateKey = process.env.CRYPTO_PRIVATE_KEY;

const encodeVoteId = (voteId: number) => {
    let encodedId = "";
    do {
        encodedId = CryptoJS.AES.encrypt(voteId.toString(), privateKey as string).toString();
    } while (encodedId.search("/") != -1);

    return encodedId;
};

const decodeVoteId = (encodedId: string) => {
    const voteId = CryptoJS.AES.decrypt(encodedId, privateKey as string).toString(
        CryptoJS.enc.Utf8
    );
    return voteId;
};

export default {
    encodeVoteId,
    decodeVoteId,
};
