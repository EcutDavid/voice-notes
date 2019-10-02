const http = require("http");
const jwt = require("jsonwebtoken");
const JwksClient = require("jwks-rsa");

const jwksClient = JwksClient({
  jwksUri: "https://davidguan.auth0.com/.well-known/jwks.json"
});
// TODO: inject config at build time when multi envs provisioned.
// (and prevent the two copies of config).
const auth0Conifg = {
  domain: "davidguan.auth0.com",
  clientId: "luC7PVwEEmjBTCC3HUenRepY5U3Zgrru",
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

const server = http.createServer((req, res) => {
  // Origin is sent with CORS requests.
  if (allowedOrigin.has(req.headers["origin"])) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
  }

  const authParts = (req.headers["authorization"] || "").split(" ");
  if (authParts.length === 2 && authParts[0] === "Bearer") {
    jwt.verify(authParts[1], getJwtKey, jwtOptions, (err, decoded) => {
      if (err) {
        res.statusCode = 400; // Client auth failed.
        res.end(":(");
        return;
      }

      const ret = JSON.stringify({ message: "Welcome" });
      res.end(ret);
    });
    return;
  }
  res.end();
});

server.listen(8080);
