import { assert, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const testImgUrl =
    "https://picmeserver-bucket.s3.ap-northeast-2.amazonaws.com/1673262127114_KakaoTalk_20230101_195809560.jpg";
const testLocation =
    '[{"x":8,"y":37.7,"degRate":-27.59},{"x":27.2,"y":24.9,"degRate":54.59},{"x":30.6,"y":44.9,"degRate":-28.95}]';

describe("[GET] /vote/player", () => {
    it("1031번 투표 플레이어 조회", (done) => {
        request(app)
            .get("/vote/player/1031")
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal("투표와 스티커 가져오기를 성공 했습니다.");

                const { Picture, Sticker } = res.body.data;
                const { pictureId, url, count } = Picture;

                expect(pictureId).to.equal(1031);
                expect(url).to.equal(testImgUrl);
                expect(count).to.equal(1);

                if (Sticker.length != 0) {
                    Sticker.map((data: any) => {
                        const { stickerLocation, emoji, count } = data;

                        expect(stickerLocation).to.equal(testLocation);
                        expect(emoji).to.equal(1);
                        expect(count).to.equal(3);
                    });
                }

                assert.ok(res);
                done();
            })
            .catch((err) => {
                assert.notOk(err);
                done();
            });
    });
});
