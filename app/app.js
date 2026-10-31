const crypto = require("crypto");
const express = require("express");

app.use(express.json());

const links = new Map();

function newCode() {
  let code;
  do {
    code = crypto.randomBytes(3).toString("hex");
  } while (links.has(code));
  return code;
}

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
  res.status(201).json({ code, url: parsed.href });
});

module.exports = app;
