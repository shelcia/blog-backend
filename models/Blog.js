const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  //DATE IS THE ID
  userId: {
    type: String,
    required: true,
  },
  uname: {
    type: String,
  },
  title: {
    type: String,
  },
  desc: {
    type: String,
  },
  content: {
    type: String,
    // required: true,
  },
  likes: {
    type: [
      {
        userId: String,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    // required: true,
  },
  comments: {
    type: [
      {
        id: String,
        userId: String,
        comment: String,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  tags: {
    type: Array,
  },
  image: {
    type: Buffer,
  },
  type: {
    type: String, // PUBLSIHED or DRAFT
    required: true,
  },
  contentHistory: {
    type: [
      {
        id: String,
        userId: String,
        title: String,
        desc: String,
        type: String,
        image: Buffer,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// module.exports = mongoose.model("Blog", blogSchema);

module.exports = mongoose.model("Blog", blogSchema);
