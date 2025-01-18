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

// Path to Excel file and images folder
const xlsxFilePath = "L:/MED/Datasets/random images with text/images_info.xlsx";
const imagesFolderPath = "L:/MED/Datasets/random images with text/images";

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB.");
      // generateDummyPosts(); // Generate posts after connection is established
    });

    mongoose.connection.on("error", () => {
      console.error("Failed to connect to MongoDB.");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

// Function to upload an image to Supabase
async function uploadImageToSupabase(filePath, userId, postId) {
  const fileType = path.extname(filePath).substring(1); // Get the file extension
  const fileName = `1.${fileType}`; // Use `1` as the first index for a single image
  const fileBuffer = fs.readFileSync(filePath);

  // Construct the file path following your naming convention
  const filePathSupabase = `posts_files/user_${userId}/post_${postId}/${fileName}`;

  const { error } = await supabase.storage
    .from("instagram-clone")
    .upload(filePathSupabase, fileBuffer, {
      contentType: `image/${fileType}`,
    });

  if (error) {
    console.error("Error uploading image to Supabase:", error.message);
    return null;
  }

  return filePathSupabase; // Return the full path in Supabase
}

// Function to generate dummy posts
async function generateDummyPosts() {
  try {
    // Read Excel file
    const workbook = xlsx.readFile(xlsxFilePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length < 30) {
      throw new Error("The Excel file contains less than 30 entries.");
    }

    const selectedData = data.slice(0, 30); // Take the first 30 rows
    const posts = [];

    for (let i = 0; i < selectedData.length; i++) {
      const { id, image, caption } = selectedData[i];
      const imagePath = path.join(imagesFolderPath, image);

      // Check if the image file exists
      if (!fs.existsSync(imagePath)) {
        console.error(`Image not found: ${imagePath}`);
        continue;
      }

      // Generate a unique postId
      const postId = new mongoose.Types.ObjectId(); // Generate a unique ObjectId for the post
      // Select a random user to associate with the post
      const randomUser = await User.aggregate([{ $sample: { size: 1 } }]);

      // Upload image to Supabase using the postId
      const photoUrl = await uploadImageToSupabase(
        imagePath,
        randomUser[0]._id,
        postId
      );
      if (!photoUrl) {
        console.error(`Failed to upload image for post ${id}`);
        continue;
      }

      // Create a new post
      const post = new Post({
        _id: postId, // Assign the generated postId
        body: caption,
        photo: [photoUrl],
        postedBy: randomUser[0]._id,
      });

      posts.push(post);
    }

    // Save posts to MongoDB
    await Post.insertMany(posts);
    console.log("30 dummy posts created successfully!");
  } catch (error) {
    console.error("Error generating dummy posts:", error.message);
  }
}

// Start the script
connectToMongoDB();
