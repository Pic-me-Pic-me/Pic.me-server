import { assert, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const randomID = Math.floor(Math.random() * 999999999);
const testPassword = process.env.TEST_PASSWORD as string;

describe("[POST] /auth", () => {
    it("자체 회원가입 테스트", (done) => {
        request(app)
            .post("/auth")
            .set("Accept", "application/json")
            .type("application/json")
            .send({
                email: `test${randomID}@gmail.com`,
                password: testPassword,
                username: `test_${randomID}`,
            })
            .then((res) => {
                expect(res.status).to.equal(201);

                expect(res.body.data).ownProperty("refreshToken");
                expect(res.body.data).ownProperty("accessToken");
                expect(res.body.data).ownProperty("id");

                const { userName } = res.body.data;

                expect(userName).to.equal(`test_${randomID}`);

                assert.ok(res);
                done();
            })
            .catch((err) => {
                assert.notOk(err);
                done();
            });
    });
});
