// TODO: add proper logging(e.g., sentry.io).
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const JwksClient = require("jwks-rsa");

const { createVoiceNote, getVoiceNotes } = require("./voice-notes");

const app = express();
const jsonParser = bodyParser.json();

const port = process.env.PORT || 8080;

// TODO: inject config at build time when multi envs provisioned.
const auth0Conifg = {
  domain: "davidguan.auth0.com",
  audience: "https://davidguan.app/voice-notes-app/api",
  jwksUri: "https://davidguan.auth0.com/.well-known/jwks.json"
};
const jwksClient = JwksClient({ jwksUri: auth0Conifg.jwksUri });
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

const allowedSubs = new Set([
  "auth0|5d969898d2c2620c5573aa4f",
  "auth0|5d99b106f208d00e16ecb8ac",
  "auth0|5d99b3db3521390e23f03689"
]);

app.use(cors(corsOptions));

const jwtOptions = {
  audience: auth0Conifg.audience,
  issuer: `https://${auth0Conifg.domain}/`,
  algorithm: ["RS256"]
};
function validateRequest(req, res, next) {
  const authParts = (req.headers["authorization"] || "").split(" ");
  if (authParts.length === 2 && authParts[0] === "Bearer") {
    jwt.verify(authParts[1], getJwtKey, jwtOptions, (err, decoded) => {
      if (err) {
        res.statusCode = 401;
        res.send({ msg: "Unauthorized" });
        return;
      }
      if (!allowedSubs.has(decoded.sub)) {
        res.statusCode = 401;
        res.send({ msg: "Sub Not Allowed" });
        console.log("Request for unallowed:", decoded.sub, "at:", new Date());
        return;
      }
      console.log(
        "Successfully decoded a JWT for",
        decoded.sub,
        "at:",
        new Date()
      );
      req.userId = decoded.sub;
      next();
    });
    return;
  }

  res.statusCode = 401;
  res.send({ msg: "Unauthorized" });
}

app.post("/voice-notes", validateRequest, jsonParser, (req, res) => {
  const { content, title } = req.body;
  if (!content || !title) {
    res.statusCode = 400;
    return res.send({ msg: "Bad Request" });
  }
  createVoiceNote(title, content, req.userId)
    .then(() => {
      res.send();
    })
    .catch(() => {
      res.statusCode = 500;
      res.send({ msg: "Internal Server Error" });
    });
});

app.get("/voice-notes", validateRequest, (req, res) => {
  getVoiceNotes(req.userId)
    .then(notes => {
      res.send(notes);
    })
    .catch(() => {
      res.statusCode = 500;
      res.send({ msg: "Internal Server Error" });
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
