const http = require("http");
const jwt = require("jsonwebtoken");
const JwksClient = require("jwks-rsa");

const jwksClient = JwksClient({
  jwksUri: "https://davidguan.auth0.com/.well-known/jwks.json"
});

const auth0Conifg = {
  domain: "davidguan.auth0.com",
  clientId: "luC7PVwEEmjBTCC3HUenRepY5U3Zgrru",
  audience: "https://davidguan.me/test"
};
const jwtOptions = {
  audience: auth0Conifg.audience,
  issuer: `https://${auth0Conifg.domain}/`,
  algorithm: ["RS256"]
};

function getJwtKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function(err, key) {

    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // TODO: more sepecific
  res.setHeader("Access-Control-Allow-Headers", "*");


  const authParts = (req.headers["authorization"] || "").split(" ");
  console.log(req.headers);
  if (authParts.length === 2 && authParts[0] === "Bearer") {
    console.log('hit 1');
    jwt.verify(authParts[1], getJwtKey, jwtOptions, (err, decoded) => {
      console.log("hit 2");
      if (err) {
        console.error(err);
        res.statusCode = 400; // Client auth failed.
        res.end(':(')
        return;
      }
      // All good!
      res.end("Hello World");
    });
  } else {
    res.end();
  }
});

server.listen(8080);
