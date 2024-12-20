const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys");
const mongoose = require("mongoose");
const USER = mongoose.model("USER");

module.exports = (req, res, next) => {
  if (!req.cookies.jwt_token) {
    return res.status(401).json({ error: "You must have logged in 1" });
  }
  let token = req.cookies.jwt_token;

  try {
    jwt.verify(token, Jwt_secret, (err, payload) => {
      if (err) {
        return res.status(401).json({ error: "You must have logged in 2" });
      }

      const { _id } = payload;
      USER.findById(_id).then((userData) => {
        req.user = userData;
        next();
      });
    });
  } catch (error) {
    console.log(error);
  }
};
