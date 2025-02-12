const express = require("express");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;

const POST = mongoose.model("POST");
const COMMENT = mongoose.model("COMMENT");
const LIKE = mongoose.model("LIKE");

const {
  uploadFiles,
  createSignedUrls,
} = require("../utilities/supabase/uploadFiles");

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

module.exports = router;
