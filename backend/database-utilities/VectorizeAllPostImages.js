const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();
require("../models/post");
require("../models/model");
const POST = mongoose.model("POST");
const MONGODB_URL = "mongodb://0.0.0.0:27017/insta-clone";
const { createClient } = require("@supabase/supabase-js");
const FormData = require("form-data");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const getAllPosts = async () => {
  let posts = await POST.find({});

  //console.log(posts);
  posts = posts.map((e) => {
    return { post_id: e._id, url: e.photo[0] };
  });

  // Convert the array to a JSON string with indentation
  const jsonString = JSON.stringify(posts, null, 2);

  // Write to a file
  fs.writeFileSync("images.json", jsonString, "utf-8");

  console.log("Data saved successfully!");
  //console.log(posts);
  //   for (let post in posts) {
  //     console.log(post);
  //   }
};

const connectToMongoDB = async () => {
  try {
    mongoose.connect(MONGODB_URL);

    mongoose.connection.on("connected", async () => {
      console.log("successfully connected to mongo");

      // now call the real dump function
      //get all the posts in the database with their image urls,post_ids
      //getAllPosts();
      //fetchAndStoreBlobs();
    });

    mongoose.connection.on("error", () => {
      console.log("not connected to mongodb");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

const { createSignedUrls } = require("../utilities/supabase/uploadFiles");

// const IMAGE_BLOB_DIR = "./blob_images"; // Folder to store image blobs locally

// // Ensure directory exists
// if (!fs.existsSync(IMAGE_BLOB_DIR)) {
//   fs.mkdirSync(IMAGE_BLOB_DIR);
// }

async function fetchAndStoreBlobs() {
  try {
    let imagesData = JSON.parse(fs.readFileSync("./images.json", "utf-8"));

    // Get all image paths
    const imagePaths = imagesData.map((img) => img.url);

    // Get signed URLs
    const signedUrls = await createSignedUrls(imagePaths);

    if (signedUrls.length !== imagePaths.length) {
      console.error("Mismatch in signed URLs and image paths!");
      return;
    }

    // Process each image
    for (let i = 0; i < signedUrls.length; i++) {
      const signedUrl = signedUrls[i];
      const post_id = imagesData[i].post_id;
      const localBlobPath = `${IMAGE_BLOB_DIR}/${post_id}.jpg`;

      try {
        // Fetch the image blob
        const response = await axios.get(signedUrl, {
          responseType: "arraybuffer",
        });

        // Save blob locally
        fs.writeFileSync(localBlobPath, response.data);

        // Update JSON with signed URL and local blob path
        imagesData[i].signed_url = signedUrl;
        imagesData[i].blob_path = localBlobPath;

        console.log(`Downloaded & stored: ${post_id}`);
      } catch (err) {
        console.error(`Error downloading image ${post_id}:`, err.message);
      }
    }

    // Write updated data back to JSON
    fs.writeFileSync(
      "images.json",
      JSON.stringify(imagesData, null, 2),
      "utf-8"
    );

    console.log("All images downloaded & stored successfully!");
  } catch (error) {
    console.error("Error in fetchAndStoreBlobs:", error.message);
  }
}

UPLOAD_ENDPOINT = process.env.IMAGE_SEARCH_PYTHON_API + "/upload-image";
//console.log(UPLOAD_ENDPOINT);
const uploadImagesToVectorDB = async () => {
  try {
    let imagesData = JSON.parse(fs.readFileSync("images.json", "utf-8"));

    for (let i = 1; i < imagesData.length; i++) {
      const { post_id, blob_path, url } = imagesData[i]; // Use 'url' (not signed_url)

      if (!fs.existsSync(blob_path)) {
        console.error(`Blob not found for ${post_id}, skipping.`);
        continue;
      }

      try {
        // Create FormData
        const formData = new FormData();
        formData.append("image", fs.createReadStream(blob_path));
        formData.append("post_id", post_id); // Send post_id
        formData.append("url", url); // Send original image URL

        // Send to FastAPI
        const uploadResponse = await axios.post(UPLOAD_ENDPOINT, formData, {
          headers: { ...formData.getHeaders() },
        });

        console.log(
          `Uploaded: ${post_id}, Response:`,
          uploadResponse.data.message
        );
      } catch (err) {
        console.error(`Error uploading image ${post_id}:`, err.message);
      }
    }

    console.log("All images uploaded to vector DB successfully!");
  } catch (error) {
    console.error("Error in uploadImagesToVectorDB:", error.message);
  }
};

//uploadImagesToVectorDB();
//connectToMongoDB();
