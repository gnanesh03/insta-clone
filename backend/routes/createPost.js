const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const { route } = require("./auth");
const multer = require("multer");
const validateFiles = require("../utilities/files/FileValidation");
const {
  uploadFiles,
  createSignedUrls,
} = require("../utilities/supabase/uploadFiles");
const POST = mongoose.model("POST");

// Route
router.get("/allposts", requireLogin, async (req, res) => {
  let limit = req.query.limit;
  let skip = req.query.skip;
  POST.find()
    .populate("postedBy", "_id name Photo")
    .populate("comments.postedBy", "_id name")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .then(async (posts) => {
      // add signed urls to the photo field
      for (const post of posts) {
        const file_urls = await createSignedUrls(post.photo);
        post.photo = file_urls;
      }
      res.json(posts);
    })
    .catch((err) => console.log(err));
});

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

      await post.save().then((result) => {
        //console.log("RESULT", result);
        post_id = result._id;
      });

      //now store the images in the database
      const file_paths = await uploadFiles(files, req.user._id, post_id);

      //now you need to update the post table with the urls of the files
      await POST.updateOne(
        { _id: post_id },
        {
          $set: { photo: file_paths },
        }
      );

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

router.put("/like", requireLogin, (req, res) => {
  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name Photo")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/unlike", requireLogin, (req, res) => {
  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name Photo")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    comment: req.body.text,
    postedBy: req.user._id,
  };
  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name Photo")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
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
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
