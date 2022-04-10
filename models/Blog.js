const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  //DATE IS THE ID
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  desc: {
    type: String,
  },
  content: {
    type: String,
    required: true,
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
    required: true,
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
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// module.exports = mongoose.model("Blog", blogSchema);

module.exports = mongoose.model("Blog", blogSchema);
