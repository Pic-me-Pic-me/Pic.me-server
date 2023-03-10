import { assert, Assertion, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const testId = process.env.TEST_EMAIL as string;
const testPassword = process.env.TEST_PASSWORD as string;

const signIn = async () => {
    const res = await request(app)
        .post("/auth/signin")
        .set("Accept", "application/json")
        .type("application/json")
        .send({
            email: testId,
            password: testPassword,
        });

    expect(res.status).to.equal(200);

    expect(res.body.data).ownProperty("refreshToken");
    expect(res.body.data).ownProperty("accessToken");

    const { id, userName } = res.body.data;

    expect(id).to.equal(471);
    expect(userName).to.equal("test_code_admin");

    return res.body.data.accessToken;
};

describe("[GET] /vote/left", () => {
    it("라이브러리 가로 스크롤 테스트", (done) => {
        signIn().then(async (res) => {
            const initResponse = await request(app)
                .get("/vote/left?flag=632&date=202301")
                .set("Accept", "application/json")
                .set("Authorization", "bearer " + res)
                .type("application/json");

            expect(initResponse.status).to.equal(200);

            expect(initResponse.body.data.length).to.equal(5);

            const lastFlag = initResponse.body.data[4].id;

            const leftResponse = await request(app)
                .get(`/vote/left?flag=${lastFlag}&date=202301`)
                .set("Accept", "application/json")
                .set("Authorization", "bearer " + res)
                .type("application/json");

            expect(leftResponse.status).to.equal(200);

            expect(leftResponse.body.data.length).to.equal(2);

            const endFlag = leftResponse.body.data[1].id;

            const endResponse = await request(app)
                .get(`/vote/left?flag=${endFlag}&date=202301`)
                .set("Accept", "application/json")
                .set("Authorization", "bearer " + res)
                .type("application/json");

            expect(endResponse.status).to.equal(200);

            expect(endResponse.body.data.length).to.equal(0);

            assert.ok(endResponse);
            done();
        });
    });
});
