const express = require("express");
const app = express();
const port = process.env.port || 5000;
const mongoose = require("mongoose");
const { mongoUrl } = require("./keys");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const connectToMongoDB = require("./database-utilities/ConnectToDatabase.js");

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(cookieParser());

require("./models/model");
require("./models/post");
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/createPost"));
app.use(require("./routes/user"));
app.use(require("./routes/test routes/SignedUrl.js"));

connectToMongoDB(mongoose);

// serving the frontend
app.use(express.static(path.join(__dirname, "./frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "./frontend/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});

app.listen(port, () => {
  console.log("server is running on port" + " " + port);
});
