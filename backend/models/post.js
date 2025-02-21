const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    photo: [
      {
        type: String,
        require: true,
      },
    ],

    postedBy: {
      type: ObjectId,
      ref: "USER",
    },

    popularity_score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const like_schema = new mongoose.Schema(
  {
    post_id: { type: ObjectId, ref: "POST", required: true },
    user_id: { type: ObjectId, ref: "USER", required: true },
  },
  { timestamps: true }
);

const comment_schema = new mongoose.Schema(
  {
    post_id: { type: ObjectId, ref: "POST", required: true },
    body: { type: String },
    posted_by: { type: ObjectId, ref: "USER", required: true },
  },
  { timestamps: true }
);

const comment_reply_schema = new mongoose.Schema(
  {
    comment_id: { type: ObjectId, ref: "COMMENT", required: true },
    body: { type: String },
    posted_by: { type: ObjectId, ref: "USER", required: true },
  },
  { timestamps: true }
);

// const POST_IMAGE_FEATURE_VECTOR = new mongoose.Schema({
//   feature_vector: [{ type: Number, required: true }],
//   url: { type: String, required: true },
//   post_id: { type: ObjectId, ref: "POST", required: true },
// });

postSchema.pre("remove", async function (next) {
  await mongoose.model("LIKE").deleteMany({ post_id: this._id });
  await mongoose.model("COMMENT").deleteMany({ post_id: this._id });
  next();
});

comment_schema.pre("remove", async function (next) {
  await mongoose.model("COMMENT_REPLY").deleteMany({ comment_id: this._id });
  next();
});

mongoose.model("POST", postSchema);
mongoose.model("LIKE", like_schema);
mongoose.model("COMMENT", comment_schema);
mongoose.model("COMMENT_REPLY", comment_reply_schema);
