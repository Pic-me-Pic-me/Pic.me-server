import { assert, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const testLocation = [
    { x: 8, y: 37.7, degRate: -27.59 },
    { x: 27.2, y: 24.9, degRate: 54.59 },
    { x: 30.6, y: 44.9, degRate: -28.95 },
];

describe("[POST] /sticker", () => {
    it("20번 스티커 Paste", (done) => {
        request(app)
            .post("/sticker")
            .set("Accept", "application/json")
            .type("application/json")
            .send({
                pictureId: 20,
                emoji: 1,
                location: testLocation,
            })
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal("스티커 생성 성공");

                expect(res.body.data).to.equal(7);

                assert.ok(res);
                done();
            })
            .catch((err) => {
                assert.notOk(err);
                done();
            });
    });
});
