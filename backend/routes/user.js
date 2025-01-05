const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");
const { validateProfileImage } = require("../utilities/files/FileValidation");
const {
  uploadProfilePicToPublic,
  createSignedUrls,
} = require("../utilities/supabase/uploadFiles");

// to get user profile
router.get("/user/:id", async (req, res) => {
  //test

  const user_id = req.params.id;
  try {
    USER.findOne({ _id: req.params.id })
      .select("-password")
      .then(async (user) => {
        const posts = await POST.aggregate([
          { $match: { postedBy: user._id } },
          { $sort: { createdAt: -1 } },
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
              likes: { user_id: 1 },
              createdAt: 1,
            },
          },
        ]);

        // Add signed URLs to photos
        for (const post of posts) {
          post.photo = await createSignedUrls(post.photo);
        }

        console.log("and user profile data sent?");
        res.status(200).json({ user, posts });
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error });
  }
});

// to follow user
router.put("/follow", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      USER.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        {
          new: true,
        }
      )
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

// to unfollow user
router.put("/unfollow", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.body.followId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      USER.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.followId },
        },
        {
          new: true,
        }
      )
        .then((result) => res.json(result))
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

// to upload profile pic
router.put(
  "/uploadProfilePic",
  validateProfileImage.single("file"),
  requireLogin,
  async (req, res) => {
    try {
      //upload to supabase public bucket
      let file_name = await uploadProfilePicToPublic(req.file, req.user._id);
      // now construct  the direct url from the supabase
      url =
        "https://cxaccwdzeeeqiykdrehu.supabase.co/storage/v1/object/public/instagram-clone-profile-images/user-profile-images/" +
        file_name;

      USER.findByIdAndUpdate(
        req.user._id,
        {
          $set: { Photo: url },
        },
        {
          new: true,
        }
      ).exec((err, result) => {
        if (err) {
          return res.status(422).json({ error: er });
        } else {
          res.status(200).json(result);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
