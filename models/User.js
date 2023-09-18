const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  image: {
    type: Buffer,
  },
  //needs to be removed
  avatar: {
    type: Buffer,
  },
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  uname: {
    type: String,
    // required: true,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  desc: {
    type: String,
    min: 2,
  },
  likedBlogs: {
    type: [
      {
        blogId: String,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  savedBlogs: {
    type: [
      {
        blogId: String,
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

module.exports = mongoose.model("User", userSchema);
