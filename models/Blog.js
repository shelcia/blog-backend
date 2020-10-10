
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  //DATE IS THE ID
  id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  dislikes: {
    type: Number,
    required: true,
  },
  hearts: {
    type: Number,
    required: true,
  },
  comments: {
    type: Array,
  }
});

module.exports = mongoose.model("Post", postSchema);