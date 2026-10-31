const crypto = require("crypto");
const express = require("express");
const client = require("prom-client");

app.use(express.json());

const links = new Map();

function newCode() {
  let code;
  do {
    code = crypto.randomBytes(3).toString("hex");
  } while (links.has(code));
  return code;
}

client.collectDefaultMetrics();

const requests = new client.Counter({
  name: "http_requests_total",
  help: "HTTP requests",
  labelNames: ["method", "status"],
});

const linksCreated = new client.Counter({
  name: "links_created_total",
  help: "Short links created",
});

const redirectsTotal = new client.Counter({
  name: "redirects_total",
  help: "Redirects served",
});

app.use((req, res, next) => {
  res.on("finish", () => {
    requests.inc({ method: req.method, status: res.statusCode });
  });
  next();
});

const app = express();

app.use(express.json());

const links = new Map();

function newCode() {
  let code;
  do {
    code = crypto.randomBytes(3).toString("hex");
  } while (links.has(code));
  return code;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/shorten", (req, res) => {
  const { url } = req.body || {};
  let parsed;
  try {
    parsed = new URL(url);
  } catch (err) {
    return res.status(400).json({ error: "valid url is required" });
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "only http and https urls are allowed" });
  }
  const code = newCode();
  links.set(code, { url: parsed.href, clicks: 0 });
  linksCreated.inc();
  res.status(201).json({ code, url: parsed.href });
});

app.get("/stats/:code", (req, res) => {
  const link = links.get(req.params.code);
  if (!link) {
    return res.status(404).json({ error: "not found" });
  }
  res.json({ code: req.params.code, url: link.url, clicks: link.clicks });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/:code", (req, res) => {
  const link = links.get(req.params.code);
  if (!link) {
    return res.status(404).json({ error: "not found" });
  }
  link.clicks += 1;
  redirectsTotal.inc();
  res.redirect(302, link.url);
});

module.exports = app;
