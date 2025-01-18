const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { createSignedUrls } = require("../utilities/supabase/uploadFiles");

const getPostDetails = async (post_id) => {
  try {
    let post_data = await mongoose.model("POST").aggregate([
      { $match: { _id: mongoose.Types.ObjectId(post_id) } },
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

    const comments_data = await mongoose.model("COMMENT").aggregate([
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

    post_data = post_data[0];

    // Add signed URLs to photos
    post_data.photo = await createSignedUrls(post_data.photo);

    return { post_data, comments_data };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getPostDetails;
