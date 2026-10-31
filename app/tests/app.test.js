const request = require("supertest");
const app = require("../app");

test("health returns ok", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: "ok" });
});

test("shorten creates a link", async () => {
  const res = await request(app).post("/shorten").send({ url: "https://example.com" });
  expect(res.status).toBe(201);
  expect(res.body.code).toHaveLength(6);
});

test("shorten rejects invalid url", async () => {
  const res = await request(app).post("/shorten").send({ url: "not-a-url" });
  expect(res.status).toBe(400);
});