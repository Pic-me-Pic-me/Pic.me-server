import { assert, Assertion, expect } from "chai";
import request from "supertest";
import app from "../../src/index";
import mocha from "mocha";

const describe = mocha.describe;
const it = mocha.it;

const testId = process.env.TEST_EMAIL as string;
const testPassword = process.env.TEST_PASSWORD as string;

const dates = [202301, 202211, 202210];
const dateLeftover = [202209];

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

    expect(id).to.equal(68);
    expect(userName).to.equal("test_943657549");

    return res.body.data.accessToken;
};

describe("[GET] /vote/all", () => {
    it("라이브러리 세로 스크롤 테스트", (done) => {
        signIn().then(async (res) => {
            const initResponse = await request(app)
                .get("/vote/all?flag=0")
                .set("Accept", "application/json")
                .set("Authorization", "bearer " + res)
                .type("application/json");

            expect(initResponse.status).to.equal(200);

            let lastFlag: any;
            initResponse.body.data.map((data: any, index: any) => {
                expect(data.date).to.equal(dates[index]);
                expect(data.votes.length).to.equal(5);
                lastFlag = dates[index];
            });

            const leftRepsonse = await request(app)
                .get(`/vote/all?flag=${lastFlag}`)
                .set("Accept", "application/json")
                .set("Authorization", "bearer " + res)
                .type("application/json");

            expect(leftRepsonse.status).to.equal(200);

            leftRepsonse.body.data.map((data: any, index: any) => {
                expect(data.date).to.equal(dateLeftover[index]);
                expect(data.votes.length).to.equal(5);
            });

            assert.ok(leftRepsonse);
            done();
        });
    });
});
