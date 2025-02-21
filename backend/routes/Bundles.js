const express = require("express");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const { upload } = require("../utilities/files/FileValidation");
const axios = require("axios");
const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;

const POST = mongoose.model("POST");
const COMMENT = mongoose.model("COMMENT");
const LIKE = mongoose.model("LIKE");
const USER = mongoose.model("USER");

const {
  uploadFiles,
  createSignedUrls,
} = require("../utilities/supabase/uploadFiles");
const e = require("express");

router.get("/comments-of-post", requireLogin, async (req, res) => {
  //console.log("being called");

  const { post_id } = req.query;

  if (!post_id) {
    return res.status(400).json({ error: "post id is required" });
  }

  try {
    const comments = await COMMENT.aggregate([
      // Match comments for the given post_id
      { $match: { post_id: ObjectId(post_id) } },

      { $sort: { createdAt: -1 } },

      // Lookup details of the user who posted the comment
      {
        $lookup: {
          from: "users",
          localField: "posted_by",
          foreignField: "_id",
          as: "posted_by_details",
        },
      },

      {
        $lookup: {
          from: "comment_replies",
          localField: "_id",
          foreignField: "comment_id",
          as: "replies",
        },
      },

      // Unwind the replies array for individual processing
      {
        $unwind: {
          path: "$replies",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup details for the user who posted each reply
      {
        $lookup: {
          from: "users",
          localField: "replies.posted_by",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                userName: 1,
                Photo: 1, // Include only necessary fields
              },
            },
          ],
          as: "reply_posted_by_details",
        },
      },

      // Add reply user details to the `replies` array and reconstruct it
      {
        $addFields: {
          "replies.posted_by": {
            $arrayElemAt: ["$reply_posted_by_details", 0],
          },
        },
      },

      // Group replies back into an array after processing each individually
      {
        $group: {
          _id: "$_id",
          body: { $first: "$body" },
          post_id: { $first: "$post_id" },
          posted_by_details: { $first: "$posted_by_details" },
          replies: { $push: "$replies" },
        },
      },

      // Unwind `posted_by_details` for the main comment
      {
        $unwind: {
          path: "$posted_by_details",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Final projection to structure the output
      {
        $project: {
          _id: 1,
          body: 1,
          post_id: 1,
          posted_by: {
            _id: "$posted_by_details._id",
            userName: "$posted_by_details.userName",
            Photo: "$posted_by_details.Photo",
          },
          replies: {
            $filter: {
              input: "$replies",
              as: "reply",
              cond: { $ne: ["$$reply", {}] }, // Remove empty objects
            },
          },
        },
      },
    ]);

    return res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
});

router.get("/trending-posts", requireLogin, async (req, res) => {
  let limit = Number(req.query.limit);
  let skip = Number(req.query.skip);
  //first we need to get all posts from last two weeks
  try {
    const posts = await POST.aggregate([
      //stage 1 first we need to get all posts from last two weeks
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
      },

      //stage 2
      { $sort: { popularity_score: -1 } },

      { $skip: skip },

      { $limit: limit },

      //stage
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
          popularity_score: 1,
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

router.get("/search-users", requireLogin, async (req, res) => {
  const { query } = req.query;
  // console.log("some", query);

  if (!query) {
    return res.status(400).json({ error: "User query is required" });
  }

  try {
    const users = await USER.find(
      {
        $or: [
          { userName: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      },
      { password: 0 }
    );

    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

router.get("/search-posts", requireLogin, async (req, res) => {
  try {
    const skip = (Number(req.query.page) - 1) * 9;
    const search_term = req.query.query;

    let sort_type = {};
    if (req.query.sort === "popular") {
      sort_type = { popularity_score: -1 };
    } else {
      sort_type = { score: { $meta: "textScore" } };
    }

    if (!search_term) {
      return res.status(400).json({ error: "Query is required" });
    }

    // in order to search the query so each word in the query is present we need to split the query
    // and add "\"word\"" to each word in the query

    let qeury_string = "";

    for (str of search_term.split(" ")) {
      qeury_string += '"' + str + '"' + " ";
    }

    let data = await POST.aggregate([
      { $match: { $text: { $search: qeury_string } } },

      {
        $facet: {
          results: [
            { $sort: sort_type },

            { $skip: skip },
            { $limit: 9 },

            {
              $lookup: {
                from: "users",
                localField: "postedBy",
                foreignField: "_id",
                as: "posted_by",
              },
            },

            // modify posted_by field to change it from array to object
            {
              $addFields: {
                posted_by: { $arrayElemAt: ["$posted_by", 0] },
              },
            },

            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post_id",
                as: "likes",
              },
            },
            {
              $project: {
                body: 1,
                photo: 1,
                posted_by: { _id: 1, userName: 1, Photo: 1 },
                likes: { user_id: 1 },
                createdAt: 1,
              },
            },
          ],
          // total count of the search query results without the skip
          total_count: [{ $count: "count" }],
        },
      },
    ]);

    for (const post of data[0].results) {
      post.photo = await createSignedUrls(post.photo);
    }

    //formatting the data object cause its a mess
    data = data[0];
    data.total_count =
      data.total_count.length > 0 ? data.total_count[0].count : 0;

    return res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
});

router.post(
  "/search-similar-image",
  upload.single("image"),
  requireLogin,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ messaeg: "File is needed" });
    }
    try {
      const form_data = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype }); // Convert to Blob
      form_data.append("image", blob, req.file.originalname);

      //send the image to the python api
      const url = process.env.IMAGE_SEARCH_PYTHON_API + "/search-image";
      const response = await axios.post(url, form_data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let similar_images = response.data.similar_images;

      // Extract only URLs
      let image_urls = similar_images.map((e) => e.url);

      // Generate signed URLs
      const signed_urls = await createSignedUrls(image_urls);

      // ✅ Update `similar_images` with the signed URLs
      for (let i = 0; i < similar_images.length; i++) {
        similar_images[i].url = signed_urls[i]; // ✅ Correct assignment
      }

      // console.log(similar_images);
      return res.status(200).json(similar_images);
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
