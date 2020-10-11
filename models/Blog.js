
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
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
  content: {
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
  },
  category: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Blog", blogSchema);