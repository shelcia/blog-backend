const router = require("express").Router();

const Joi = require("joi");
const { handleImageUpload } = require("../../middleware/handleImgUpload");
const Blog = require("../../models/Blog");
const User = require("../../models/User");

//BLOG SCHEMA
const blogSchema = Joi.object({
  // id: Joi.string().required(),
  userId: Joi.string().required(),
  title: Joi.string().required(),
  desc: Joi.string().required(),
  content: Joi.string().required(),
  likes: Joi.number(),
  comments: Joi.array(),
  // tags: Joi.array(),
  tags: Joi.any(),
  type: Joi.string().required(),
  image: Joi.any(),
});

//BLOG RELATED API

// get all blogs
router.get("/", async (req, res) => {
  try {
    const results = await Blog.find({}).where("type").equals("PUBLISHED");
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    // console.log(error);
    res.status(200).send({ status: "500", message: "Error" });
  }
});

router.get("/featuredposts", async (req, res) => {
  const results = await Blog.find()
    .sort({ likes: -1 })
    .where("type")
    .equals("PUBLISHED")
    .limit(3);

  // console.log(results);
  res.status(200).send({ status: "200", message: results });
  try {
    // const results = await Blog.find({}).where("type").equals("PUBLISHED");
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    const result = await Blog.findById(req.params.id);
    res.set("Content-Type", "image/jpeg");
    res.status(200).send(result.image);
  } catch (error) {
    res.status(200).send({ status: "400", message: error });
  }
});

router.post("/", handleImageUpload, async (req, res) => {
  // console.log(req.body);
  const { error } = await blogSchema.validateAsync(req.body);
  if (error) {
    res.status(200).send({ status: "400", message: error });
    return;
  }

  let updatedBlog = req.body;

  if (req.file) updatedBlog.image = req.file.buffer;
  updatedBlog.comments = [];
  updatedBlog.likes = [];
  updatedBlog.tags = JSON.parse(updatedBlog.tags);

  const blog = new Blog(updatedBlog);
  await blog.save();
  res.status(200).send({ status: "200", message: "Successfully Created" });
  try {
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// UPDATE BLOGS

router.put("/blog/:id", handleImageUpload, async (req, res) => {
  let updatedBlog = req.body;

  if (req.file) updatedBlog.image = req.file.buffer;
  try {
    const blog = await Blog.findById(req.params.id).exec();
    blog.set(updatedBlog);
    const result = await blog.save();
    // res.send(result);
    res.status(200).send({ status: "200", message: "Successfully Edited" });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// UPDATE TYPE

router.put("/type/:id", handleImageUpload, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    blog.set({ ...blog, type: req.body.type });
    await blog.save();
    if (req.body.type === "DRAFTS") {
      res
        .status(200)
        .send({ status: "200", message: "Successfully Unpublished" });
    } else {
      res
        .status(200)
        .send({ status: "200", message: "Successfully Published" });
    }
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// add comments
router.put("/comments/:id", async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, {
      comments: req.body.comments,
    });
    // const blog = await Blog.findById(req.params.id).exec();
    // blog.set({ ...blog, comments: req.body.comments });
    // const result = await blog.save();
    res
      .status(200)
      .send({ status: "200", message: "Successfully Added Comments" });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// add likes
router.put("/likes/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();

    // console.log(
    //   req.body?.likedBlogs[req.body?.likedBlogs?.length - 1],
    //   req.params.id
    // );

    const blogLikes = blog?.likes.map((item) => item.userId);

    // console.log(blogLikes, req.body.userId);

    if (blogLikes?.includes(req.body.userId)) {
      const updateLikes = req.body.likes.filter(
        (like) => like.userId !== req.body.userId
      );
      await Blog.findByIdAndUpdate(req.params.id, { likes: updateLikes });

      const updateLikeBlogs = req.body?.likedBlogs?.filter(
        (like) => like !== req.params.id
      );

      await User.findByIdAndUpdate(req.body.userId, {
        likedBlogs: updateLikeBlogs,
      });
      res
        .status(200)
        .send({ status: "200", message: "Successfully Removed Like" });
    } else {
      await Blog.findByIdAndUpdate(req.params.id, { likes: req.body.likes });
      const user = await User.findByIdAndUpdate(req.body.userId, {
        likedBlogs: req.body.likedBlogs,
      });
      // const user = await User.findById(req.body.userId).exec();
      // console.log(user);
      res
        .status(200)
        .send({ status: "200", message: "Successfully Added Like" });
    }
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// save posts
router.put("/savedposts/:id", async (req, res) => {
  try {
    // await Blog.findByIdAndUpdate(req.params.id, { likes: req.body.likes });
    const user = await User.findOne({ userId: req.body.userId }).exec();

    if (user.savedBlogs.includes(req.params.id)) {
      const updateSavedBlogs = req.body?.savedBlogs?.filter(
        (save) => save !== req.params.id
      );

      await User.findOneAndUpdate(
        { userId: req.body.userId },
        { savedBlogs: updateSavedBlogs }
      );
    } else {
      await User.findOneAndUpdate(
        { userId: req.body.userId },
        { savedBlogs: req.body.savedBlogs }
      );
    }

    res.status(200).send({ status: "200", message: "Successfully Saved" });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

router.get("/myblogs/:id", async (req, res) => {
  try {
    const results = await Blog.find({
      userId: req.params.id,
    }).exec();
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// get blog by id
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    res.status(200).send({ status: "200", message: blog });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

router.put("/myblogs/edit/:id", async (req, res) => {
  try {
    await Blog.findOneAndUpdate(
      { id: req.params.id.toString() },
      {
        title: req.body.title,
        content: req.body.content,
        image: req.body.image,
      }
    );
    res
      .status(200)
      .send({ status: "200", message: "Successfully Edited the Blog" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

router.delete("/myblogs/delete/:id", async (req, res) => {
  try {
    await Blog.findOneAndDelete({ id: req.params.id.toString() });
    res
      .status(200)
      .send({ status: "200", message: "Successfully Deleted the Blog" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

module.exports = router;
