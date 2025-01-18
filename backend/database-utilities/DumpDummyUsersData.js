const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const { createClient } = require("@supabase/supabase-js");
require("../models/model");
const User = mongoose.model("USER");

const MONGODB_URL = "mongodb://0.0.0.0:27017/insta-clone";

const SUPABASE_URL = "https://cxaccwdzeeeqiykdrehu.supabase.co";

//supabase service role
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YWNjd2R6ZWVlcWl5a2RyZWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMzAyMTYsImV4cCI6MjA0MzcwNjIxNn0.dpHoMzoQD7iyP0EcvaWL2xfLVg-UO-aZ4A_T8q-ERU4";

// Supabase configuration
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

// Path to the folder containing images
const imagesFolderPath = "L:/MED/Datasets/human profile photos/dataset";
if (fs.existsSync(imagesFolderPath)) {
  console.log("The folder exists.");
} else {
  console.log("The folder does not exist.");
}

const connectToMongoDB = async () => {
  try {
    mongoose.connect(MONGODB_URL);

    mongoose.connection.on("connected", () => {
      console.log("successfully connected to mongo");

      // now call the real dump function
      // generateDummyUsers();
    });

    mongoose.connection.on("error", () => {
      console.log("not connected to mongodb");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

connectToMongoDB();
console.log("hellp");

//Function to upload a profile picture to Supabase
async function uploadProfilePic(filePath, userId) {
  const fileType = path.extname(filePath).substring(1);
  const fileName = `${userId}.${fileType}`;
  const fileBuffer = fs.readFileSync(filePath);

  const { error } = await supabase.storage
    .from("instagram-clone-profile-images")
    .upload(`user-profile-images/${fileName}`, fileBuffer, {
      contentType: `image/${fileType}`,
      upsert: true,
    });

  if (error) {
    console.error("Error uploading file to Supabase:", error.message);
    return null;
  }

  // Construct the public URL for the uploaded image
  return `${SUPABASE_URL}/storage/v1/object/public/instagram-clone-profile-images/user-profile-images/${fileName}`;
}

// Function to generate dummy users
async function generateDummyUsers() {
  try {
    const imageFiles = fs.readdirSync(imagesFolderPath);
    if (imageFiles.length < 50) {
      throw new Error("Not enough images in the folder to create 50 users.");
    }
    // console.log(imageFiles);

    // process.exit(0);

    const selectedImages = imageFiles.slice(0, 50); // Select the first 50 images
    const hashedPassword = await bcrypt.hash("spider", 12); // Hash the default password
    const users = [];
    const userIds = []; // To store generated user IDs for assigning followers/following

    for (let i = 0; i < 50; i++) {
      const userId = new mongoose.Types.ObjectId(); // Generate a unique ObjectId for each user
      userIds.push(userId);
      const imagePath = path.join(imagesFolderPath, selectedImages[i]);
      const photoUrl = await uploadProfilePic(imagePath, userId);

      if (!photoUrl) {
        console.error(`Failed to upload profile picture for user ${i + 1}`);
        continue;
      }

      const user = new User({
        _id: userId,
        name: faker.person.fullName(),
        userName: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword, // Use hashed password
        Photo: photoUrl,
        followers: [], // Initialize as empty; we'll assign them later
        following: [], // Initialize as empty; we'll assign them later
      });

      users.push(user);
    }

    // Assign followers and following
    for (let user of users) {
      // Each user will follow 5-15 random users
      const followingCount = Math.floor(Math.random() * 11) + 5;
      user.following = getRandomSubset(userIds, followingCount, user._id);

      // Each user will have 5-15 random followers
      const followersCount = Math.floor(Math.random() * 11) + 5;
      user.followers = getRandomSubset(userIds, followersCount, user._id);
    }

    // Save all users to the database
    await User.insertMany(users);
    console.log("50 dummy users created successfully!");
  } catch (error) {
    console.error("Error generating dummy users:", error.message);
  }
}

// Helper function to get a random subset of user IDs (excluding a specific user)
function getRandomSubset(ids, count, excludeId) {
  const filteredIds = ids.filter((id) => !id.equals(excludeId)); // Exclude the current user
  const shuffled = filteredIds.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
