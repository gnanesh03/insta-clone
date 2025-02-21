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

const storage = multer.memoryStorage(); // Store files in memory (for simplicity)
const upload = multer({ storage: storage }); // Initialize multer with memory storage

router.post("/send-image", upload.single("file"), (req, res) => {
  console.log("esnding the ijage");
  console.log(req.file);
  res.send(req.file);
});

function createSignedURL(path) {
  const payload = {
    path: path,
    expiry_date: new Date(),
  };
}

module.exports = router;
