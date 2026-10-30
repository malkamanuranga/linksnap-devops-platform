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

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
