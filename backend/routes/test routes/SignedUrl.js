const multer = require("multer");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");

router.get("/signed-url", (req, res) => {
  let my_path = "/storage/images/user_posts/user_0/post_0/1.jpeg";
});

router.get("posts/image", (req, res) => {
  let my_path = "/storage/images/user_posts/user_0/post_0/1.jpeg";

  my_path = path.join(__dirname, "../../", my_path);
  console.log(my_path);

  console.log(fs.existsSync(my_path));

  // res.sendFile(my_path);
});

function createSignedURL(path) {
  const payload = {
    path: path,
    expiry_date: new Date(),
  };
}

module.exports = router;
