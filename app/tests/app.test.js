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


test("redirect sends user to original url and counts click", async () => {
  const created = await request(app).post("/shorten").send({ url: "https://example.com/docs" });
  const code = created.body.code;
  const res = await request(app).get(`/${code}`);
  expect(res.status).toBe(302);
  expect(res.headers.location).toBe("https://example.com/docs");
  const stats = await request(app).get(`/stats/${code}`);
  expect(stats.body.clicks).toBe(1);
});

test("unknown code returns 404", async () => {
  const res = await request(app).get("/zzzzzz");
  expect(res.status).toBe(404);
});

test("metrics endpoint exposes counters", async () => {
  const res = await request(app).get("/metrics");
  expect(res.status).toBe(200);
  expect(res.text).toContain("http_requests_total");
});