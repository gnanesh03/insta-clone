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
const SUPABASE_URL = "https://cxaccwdzeeeqiykdrehu.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YWNjd2R6ZWVlcWl5a2RyZWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMzAyMTYsImV4cCI6MjA0MzcwNjIxNn0.dpHoMzoQD7iyP0EcvaWL2xfLVg-UO-aZ4A_T8q-ERU4";

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

async function generateDummyLikesCommentsReplies() {
  try {
    // Fetch the first 30 posts from the database
    const posts = await Post.find().limit(30).exec();
    if (posts.length < 30) {
      throw new Error("Not enough posts available in the database.");
    }

    const users = await User.find().exec();
    if (users.length < 1) {
      throw new Error("No users available in the database.");
    }

    const userIds = users.map((user) => user._id); // Array of user IDs
    const likes = [];
    const comments = [];
    const replies = [];

    // Helper to shuffle array
    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    // Helper to get a random element from an array
    const getRandomElement = (array) =>
      array[Math.floor(Math.random() * array.length)];

    // Group 1: 15 posts with 35-45 likes, 1-5 comments, 20 replies overall
    for (let i = 0; i < 15; i++) {
      const post = posts[i];

      // Generate 35-45 likes
      const numLikes = Math.floor(Math.random() * 11) + 35;
      const randomLikeUsers = shuffleArray(userIds).slice(0, numLikes);
      randomLikeUsers.forEach((userId) => {
        likes.push({ post_id: post._id, user_id: userId });
      });

      // Generate 1-5 comments
      const numComments = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numComments; j++) {
        const randomUser = getRandomElement(userIds);
        const commentId = new mongoose.Types.ObjectId(); // Generate unique comment ID
        comments.push({
          _id: commentId,
          post_id: post._id,
          body: faker.lorem.sentence(), // Generate a random comment
          posted_by: randomUser,
        });

        // Generate replies for comments
        if (replies.length < 20) {
          const numReplies = Math.min(
            20 - replies.length,
            Math.floor(Math.random() * 5) + 1
          );
          for (let k = 0; k < numReplies; k++) {
            const replyUser = getRandomElement(userIds);
            replies.push({
              comment_id: commentId,
              body: faker.lorem.sentence(), // Generate a random reply
              posted_by: replyUser,
            });
          }
        }
      }
    }

    // Group 2: 10 posts with 5-10 likes, 30-40 comments, 100 replies overall
    for (let i = 15; i < 25; i++) {
      const post = posts[i];

      // Generate 5-10 likes
      const numLikes = Math.floor(Math.random() * 6) + 5;
      const randomLikeUsers = shuffleArray(userIds).slice(0, numLikes);
      randomLikeUsers.forEach((userId) => {
        likes.push({ post_id: post._id, user_id: userId });
      });

      // Generate 30-40 comments
      const numComments = Math.floor(Math.random() * 11) + 30;
      for (let j = 0; j < numComments; j++) {
        const randomUser = getRandomElement(userIds);
        const commentId = new mongoose.Types.ObjectId(); // Generate unique comment ID
        comments.push({
          _id: commentId,
          post_id: post._id,
          body: faker.lorem.paragraph(), // Generate a random comment
          posted_by: randomUser,
        });

        // Generate replies for comments
        if (replies.length < 100) {
          const numReplies = Math.min(
            100 - replies.length,
            Math.floor(Math.random() * 10) + 1
          );
          for (let k = 0; k < numReplies; k++) {
            const replyUser = getRandomElement(userIds);
            replies.push({
              comment_id: commentId,
              body: faker.lorem.sentence(), // Generate a random reply
              posted_by: replyUser,
            });
          }
        }
      }
    }

    // Group 3: 5 posts with 0-5 likes, no comments or replies
    for (let i = 25; i < 30; i++) {
      const post = posts[i];

      // Generate 0-5 likes
      const numLikes = Math.floor(Math.random() * 6);
      const randomLikeUsers = shuffleArray(userIds).slice(0, numLikes);
      randomLikeUsers.forEach((userId) => {
        likes.push({ post_id: post._id, user_id: userId });
      });

      // No comments or replies for this group
    }

    // Insert likes, comments, and replies into the database
    await mongoose.model("LIKE").insertMany(likes);
    await mongoose.model("COMMENT").insertMany(comments);
    await mongoose.model("COMMENT_REPLY").insertMany(replies);

    console.log("Dummy likes, comments, and replies generated successfully!");
  } catch (error) {
    console.error(
      "Error generating dummy likes, comments, and replies:",
      error.message
    );
  }
}

// Start the script

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB.");
      //  generateDummyLikesCommentsReplies(); // Generate posts after connection is established
    });

    mongoose.connection.on("error", () => {
      console.error("Failed to connect to MongoDB.");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

//connectToMongoDB();
