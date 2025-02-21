const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FormData = require("form-data");
const stream = require("stream");
const requireLogin = require("../middlewares/requireLogin");
const { route } = require("./auth");
const multer = require("multer");
const { validateFiles } = require("../utilities/files/FileValidation");
const axios = require("axios");
const ObjectId = mongoose.Types.ObjectId;

const {
  uploadFiles,
  createSignedUrls,
} = require("../utilities/supabase/uploadFiles");
const getPostDetails = require("../controllers/post");
const POST = mongoose.model("POST");
const COMMENT = mongoose.model("COMMENT");
const LIKE = mongoose.model("LIKE");
const COMMENT_REPLY = mongoose.model("COMMENT_REPLY");

// all posts
router.get("/allposts", requireLogin, async (req, res) => {
  let limit = Number(req.query.limit);
  let skip = Number(req.query.skip);

  try {
    const posts = await POST.aggregate([
      { $match: {} },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },

      {
        // modify postedBy field to change it from array to object
        $addFields: {
          postedBy: { $arrayElemAt: ["$postedBy", 0] },
        },
      },
      {
        $project: {
          body: 1,
          photo: 1,
          postedBy: { _id: 1, userName: 1, Photo: 1 },
          likes: { user_id: 1 },
          createdAt: 1,
        },
      },
    ]);

    // Add signed URLs to photos
    for (const post of posts) {
      post.photo = await createSignedUrls(post.photo);
    }

    let has_more = true;
    const total_posts = await POST.countDocuments();
    if (skip + limit >= total_posts) {
      has_more = false;
    }

    res.status(200).json({ posts, has_more });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// to create a post
router.post(
  "/createPost",
  requireLogin,
  validateFiles.array("files"),
  async (req, res) => {
    try {
      //   const session = await mongoose.startSession(); // Start a session // not possible currently
      //   session.startTransaction(); // Start a transaction

      const files = req.files;
      const body = req.body.body;

      if (!body || !files) {
        return res.status(422).json({ error: "Please add all the fields" });
      }

      // create a post to get its unique id
      let post_id;
      const post = new POST({
        body,
        photo: [],
        postedBy: req.user._id,
      });

      //   await post.save().then((result) => {
      //     //console.log("RESULT", result);
      //     post_id = result._id;
      //   });

      //now store the images in the database
      // const file_paths = await uploadFiles(files, req.user._id, post_id);

      //now you need to update the post table with the urls of the files
      //   await POST.updateOne(
      //     { _id: post_id },
      //     {
      //       $set: { photo: file_paths },
      //     }
      //   );

      //dont forget the vectorize the image so you can find images similar to this image
      // Step 4: Upload images to the vector database
      await uploadImagesToVectorDB(files, post_id, ["some"]);

      //   // Step 4: Commit the transaction
      //   await session.commitTransaction();
      //   session.endSession();

      return res.status(201).json({ message: "Post sent success" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "something went wrong" });
    }
  }
);

router.get("/myposts", requireLogin, (req, res) => {
  POST.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((myposts) => {
      res.json(myposts);
    });
});

router.put("/like", requireLogin, async (req, res) => {
  console.log(req.body);
  try {
    // Check if the user has already liked the post
    const existingLike = await LIKE.findOne({
      post_id: mongoose.Types.ObjectId(req.body.postId),
      user_id: mongoose.Types.ObjectId(req.user._id),
    });

    if (existingLike) {
      return res
        .status(400)
        .json({ error: "You have already liked this post." });
    }

    // Create a new like if it doesn't exist
    const result = await LIKE.create({
      post_id: mongoose.Types.ObjectId(req.body.postId),
      user_id: mongoose.Types.ObjectId(req.user._id),
    });

    // Incrementally update popularity score
    await POST.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body.postId) },
      { $inc: { popularity_score: 0.1 } },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.put("/unlike", requireLogin, async (req, res) => {
  try {
    // Find and delete the like entry for the user and the post
    const result = await LIKE.findOneAndDelete({
      post_id: mongoose.Types.ObjectId(req.body.postId),
      user_id: mongoose.Types.ObjectId(req.user._id),
    });

    if (!result) {
      return res.status(400).json({ error: "You haven't liked this post." });
    }

    await POST.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body.postId) },
      { $inc: { popularity_score: -0.1 } },
      { new: true }
    );

    res.status(200).json({ message: "Post unliked successfully." });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.put("/comment", requireLogin, async (req, res) => {
  try {
    const { text, postId } = req.body;

    // Create a new comment
    const newComment = new COMMENT({
      post_id: mongoose.Types.ObjectId(postId),
      posted_by: mongoose.Types.ObjectId(req.user._id),
      body: text,
    });

    await newComment.save();

    await POST.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body.postId) },
      { $inc: { popularity_score: 0.3 } },
      { new: true }
    );

    res.status(200).json({ message: "Comment posted successfully." });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post("/reply-to-comment", requireLogin, async (req, res) => {
  try {
    const { text, comment_id } = req.body;

    // Create a new comment
    const comment_reply = new COMMENT_REPLY({
      comment_id: mongoose.Types.ObjectId(comment_id),
      posted_by: mongoose.Types.ObjectId(req.user._id),
      body: text,
    });

    await comment_reply.save();

    res.status(200).json({ message: "reply posted successfully." });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// Api to delete post
router.delete("/deletePost/:postId", requireLogin, (req, res) => {
  POST.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }

      if (post.postedBy._id.toString() == req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            return res.json({ message: "Successfully deleted" });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});

// to show following post
router.get("/myfollwingpost", requireLogin, (req, res) => {
  POST.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(async (posts) => {
      // add signed urls to the photo field
      for (const post of posts) {
        const file_urls = await createSignedUrls(post.photo);
        post.photo = file_urls;
      }
      res.json(posts);
    })
    .catch((err) => {
      console.log(err);
    });
});

//to get the post details for a dynamic individual post page
router.get("/single-post/:id", requireLogin, async (req, res) => {
  const post_id = req.params.id;
  if (!post_id) {
    return res.status(400).json({ error: "post id is required" });
  }
  try {
    let result = await getPostDetails(post_id);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

const uploadImagesToVectorDB = async (files, post_id, file_paths) => {
  try {
    if (!files || files.length === 0) {
      console.error("❌ No images to upload for vectorization.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]; // Image file from multer
      const image_url = file_paths[i]; // Supabase stored URL

      try {
        //const blob = new Blob([file.buffer], { type: file.mimetype });

        // Create FormData object

        const formData = new FormData();
        formData.append("image", JSON.stringify(file.buffer), {
          filename: file.originalname, // Ensure valid filename
          contentType: file.mimetype,
          knownLength: file.size, // Ensure correct length
        });
        formData.append("image", file);
        formData.append("post_id", post_id);
        formData.append("url", image_url);

        // console.log(formData);
        // Send request to FastAPI
        const uploadResponse = await axios.post(
          process.env.IMAGE_SEARCH_PYTHON_API + "/upload-image",
          formData,
          { headers: { ...formData.getHeaders() } }
        );

        console.log(
          `✅ Image ${file.originalname} uploaded for post ${post_id}:`,
          uploadResponse.data.message
        );
      } catch (err) {
        console.error(
          `❌ Error uploading image ${file.originalname}:`,
          err.message
        );
      }
    }

    console.log(`✅ All images uploaded to vector DB for post: ${post_id}`);
  } catch (error) {
    console.error("❌ Error in uploadImagesToVectorDB:", error.message);
  }
};

module.exports = router;
