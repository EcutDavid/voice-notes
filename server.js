// TODO: add logging
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const JwksClient = require("jwks-rsa");

const app = express();
const jsonParser = bodyParser.json();

const port = process.env.PORT || 8080;

const jwksClient = JwksClient({
  jwksUri: "https://davidguan.auth0.com/.well-known/jwks.json"
});
// TODO: inject config at build time when multi envs provisioned.
// (and prevent the two copies of config).
const auth0Conifg = {
  domain: "davidguan.auth0.com",
  audience: "https://davidguan.app/voice-notes-app/api"
};
const jwtOptions = {
  audience: auth0Conifg.audience,
  issuer: `https://${auth0Conifg.domain}/`,
  algorithm: ["RS256"]
};

function getJwtKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const allowedOrigin = new Set([
  "http://localhost:3000",
  "https://davidguan.me"
]);
const corsOptions = {
  origin: function(origin, callback) {
    console.log("Request from:", origin, "at:", new Date());
    if (allowedOrigin.has(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

app.use(cors(corsOptions));
const validateRequest = function(req, res, next) {
  res.statusCode = 401;

  const authParts = (req.headers["authorization"] || "").split(" ");
  if (authParts.length === 2 && authParts[0] === "Bearer") {
    jwt.verify(authParts[1], getJwtKey, jwtOptions, (err, decoded) => {
      if (err) {
        res.end("Unauthorized");
        return;
      }
      console.log("Successfully decoded a JWT token,", "at:", new Date());
      res.statusCode = 200;
      next();
    });
    return;
  }
  res.end("Unauthorized");
};

app.post("/voice-notes", validateRequest, jsonParser, (req, res) => {
  const { content, title } = req.body;
  if (!content || !title) return res.end("TODO: 400");
  res.end("42");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
