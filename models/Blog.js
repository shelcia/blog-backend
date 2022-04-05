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
    type: Number,
    required: true,
  },
  comments: {
    type: [{ userId: String, comment: String, date: Date }],
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
});

// module.exports = mongoose.model("Blog", blogSchema);

module.exports = mongoose.model("Blog", blogSchema);
