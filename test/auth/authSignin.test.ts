import { assert, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const testId = process.env.TEST_EMAIL as string;
const testPassword = process.env.TEST_PASSWORD as string;

describe("[POST] /auth/signin", () => {
    it("자체 로그인 테스트", (done) => {
        request(app)
            .post("/auth/signin")
            .set("Accept", "application/json")
            .type("application/json")
            .send({
                email: testId,
                password: testPassword,
            })
            .then((res) => {
                expect(res.status).to.equal(200);

                expect(res.body.data).ownProperty("refreshToken");
                expect(res.body.data).ownProperty("accessToken");

                const { id, userName } = res.body.data;

                expect(id).to.equal(471);
                expect(userName).to.equal("test_code_admin");

                assert.ok(res);
                done();
            })
            .catch((err) => {
                assert.notOk(err);
                done();
            });
    });
});
