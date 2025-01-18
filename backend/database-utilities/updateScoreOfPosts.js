const { faker } = require("@faker-js/faker");

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { createClient } = require("@supabase/supabase-js");
require("../models/post");
require("../models/model");
const Post = mongoose.model("POST");
const User = mongoose.model("USER");

const MONGODB_URL = "mongodb://0.0.0.0:27017/insta-clone";

const calculateAndUpdatePopularityScores = async () => {
  try {
    // Aggregate posts with calculated popularity scores
    const postsWithScores = await Post.aggregate([
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post_id",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $addFields: {
          likes_count: { $size: "$likes" },
          comments_count: { $size: "$comments" },
          popularity_score: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 0.1] },
              { $multiply: [{ $size: "$comments" }, 0.3] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          popularity_score: 1,
        },
      },
    ]);

    // Update each post with the calculated popularity score
    for (const post of postsWithScores) {
      await Post.updateOne(
        { _id: post._id },
        { $set: { popularity_score: post.popularity_score } }
      );
    }

    console.log("Popularity scores updated successfully!");
  } catch (error) {
    console.error("Error updating popularity scores:", error);
  }
};

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB.");
      calculateAndUpdatePopularityScores();
    });

    mongoose.connection.on("error", () => {
      console.error("Failed to connect to MongoDB.");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

connectToMongoDB();
