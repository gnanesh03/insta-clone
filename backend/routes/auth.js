const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys");
const requireLogin = require("../middlewares/requireLogin");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const setJWTInCookie = require("../utilities/cookies/SetJWTInCookie");

router.post("/signup", (req, res) => {
  const { name, userName, email, password } = req.body;
  if (!name || !email || !userName || !password) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  USER.findOne({ $or: [{ email: email }, { userName: userName }] }).then(
    (savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "User already exist with that email or userName" });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new USER({
          name,
          email,
          userName,
          password: hashedPassword,
        });
        user
          .save()
          .then((user) => {
            res.json({ message: "Registered successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  );
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please add email and password" });
  }
  USER.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((match) => {
        if (match) {
          // return res.status(200).json({ message: "Signed in Successfully" })
          const token = jwt.sign({ _id: savedUser.id }, Jwt_secret, {
            expiresIn: "2h",
          });
          const { _id, name, email, userName } = savedUser;

          setJWTInCookie(res, token);

          res.json({ token, user: { _id, name, email, userName } });
        } else {
          return res.status(422).json({ error: "Invalid password" });
        }
      })
      .catch((err) => console.log(err));
  });
});

const CLIENT_ID = process.env.GOOGLE_OUATH_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

router.post("/api/auth/callback/google", async (req, res) => {
  const token = req.body.google_response;
  try {
    const google_response = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = google_response.getPayload();
    const { sub, email, name, picture } = payload;

    USER.findOne({ email: email }).then((savedUser) => {
      if (savedUser) {
        const token = jwt.sign({ _id: savedUser.id }, Jwt_secret, {
          expiresIn: "2h",
        });
        setJWTInCookie(res, token);

        const { _id, name, email, userName } = savedUser;
        res.json({ token, user: { _id, name, email, userName } });
      }
      // you need to create a google account in the user collection but first ask the user for a unique
      // username
      else {
        res.status(200).json({
          message: "create a username to continue",
          require_username: true,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(422)
      .json({ error: "error occureed while verifying google token" });
  }
});

router.post("/api/register-using-google", async (req, res) => {
  const { user_name, token } = req.body;

  if (!user_name || !token) {
    return res
      .status(400)
      .json({ error: "User name and the google token is required" });
  }

  try {
    const google_response = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const { email, picture, name } = google_response.getPayload();

    //check if username is already being used by other users
    USER.findOne({ userName: user_name }).then((existing_user) => {
      if (existing_user) {
        return res
          .status(400)
          .json({ error: "A User with that username already exists." });
      } else {
        const new_user = USER({
          email,
          name,
          userName: user_name,
          password: "google",
          photo: picture,
        });

        new_user.save().then((user) => {
          let userId = user._id.toString();
          const token = jwt.sign({ _id: userId }, Jwt_secret, {
            expiresIn: "2h",
          });
          const { _id, name, email, userName } = user;

          setJWTInCookie(res, token);

          res.json({ token, user: { _id, name, email, userName } });
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: "Something went wrong, invalid token" });
  }
});

router.get("/api/protected-route", (req, res) => {
  const token = req.cookies.jwt_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  } else {
    res.status(200).json({ message: "Authorized" });
  }
});

module.exports = router;
