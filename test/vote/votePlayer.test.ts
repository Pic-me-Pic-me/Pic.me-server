import { assert, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const testImgUrl =
    "https://picmeserver-bucket.s3.ap-northeast-2.amazonaws.com/1674423365280_secondImg";
const testLocation =
    '[{"x":362.9,"y":609.23,"degRate":41.82},{"x":1084.83,"y":635.08,"degRate":8.07},{"x":389.92,"y":203.08,"degRate":117.29}]';

describe("[GET] /vote/player", () => {
    it("1995 투표 플레이어 조회", (done) => {
        request(app)
            .get("/vote/player/1995")
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal("투표와 스티커 가져오기를 성공 했습니다.");

                const { Picture, Sticker } = res.body.data;
                const { pictureId, url, count } = Picture;

                expect(pictureId).to.equal(1995);
                expect(url).to.equal(testImgUrl);
                expect(count).to.equal(1);

                if (Sticker.length != 0) {
                    Sticker.map((data: any) => {
                        const { stickerLocation, emoji, count } = data;

                        expect(stickerLocation).to.equal(testLocation);
                        expect(emoji).to.equal(1);
                        expect(count).to.equal(1);
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
