const router = require("express").Router();

const Joi = require("joi");
const { handleImageUpload } = require("../../middleware/handleImgUpload");
const Blog = require("../../models/Blog");
const User = require("../../models/User");
const verify = require("../verify");

//BLOG SCHEMA
const blogSchema = Joi.object({
  // id: Joi.string().required(),
  userId: Joi.string().required(),
  uname: Joi.string().required(),
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
router.get("/all", async (req, res) => {
  try {
    const results = await Blog.find({}).select({
      userId: 1,
      title: 1,
      tags: 1,
      type: 1,
      likes: 1,
    });
    res.status(200).json({ status: "200", message: results });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ status: "500", message: "Error" });
  }
});

// get all published blogs
router.get("/", async (req, res) => {
  try {
    const results = await Blog.find({}).where("type").equals("PUBLISHED");
    res.status(200).json({ status: "200", message: results });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ status: "500", message: "Error" });
  }
});

router.get("/featuredposts", async (req, res) => {
  const results = await Blog.find()
    .select({
      userId: 1,
      title: 1,
      desc: 1,
      tags: 1,
      // type: 1,
      date: 1,
      likes: 1,
    })
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

//Add Blogs
router.post("/", handleImageUpload, verify, async (req, res) => {
  try {
    // console.log(req.body);
    if (req.body.type === "PUBLISHED") {
      const { error } = await blogSchema.validateAsync(req.body);
      if (error) {
        res.status(200).send({ status: "400", message: error });
        return;
      }
    }

    let updatedBlog = req.body;

    if (req.file) updatedBlog.image = req.file.buffer;
    updatedBlog.comments = [];
    updatedBlog.likes = [];
    updatedBlog.tags = JSON.parse(updatedBlog.tags);

    // console.log(updatedBlog);

    const blog = new Blog(updatedBlog);
    await blog.save();
    res.status(200).send({ status: "200", message: "Successfully Created" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// UPDATE BLOGS

router.put("/blog/:id", handleImageUpload, verify, async (req, res) => {
  let updatedBlog = req.body;
  try {
    if (req.body?.tags) {
      updatedBlog.tags = JSON.parse(updatedBlog.tags);
    }
    if (req.file) updatedBlog.image = req.file.buffer;
    const blog = await Blog.findById(req.params.id).exec();
    blog.set(updatedBlog);
    await blog.save();
    // res.send(result);
    res.status(200).send({ status: "200", message: "Successfully Edited" });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// UPDATE TYPE

router.put("/type/:id", handleImageUpload, verify, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    blog.set({ ...blog, type: req.body.type });
    await blog.save();
    if (req.body.type === "DRAFTS") {
      res
        .status(200)
        .json({ status: "200", message: "Successfully Unpublished" });
    } else {
      res
        .status(200)
        .json({ status: "200", message: "Successfully Published" });
    }
  } catch (error) {
    res.status(500).json({ status: "500", message: "Internal Servor Error" });
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
      .json({ status: "200", message: "Successfully Added Comments" });
  } catch (error) {
    res.status(500).json({ status: "500", message: "Internal Servor Error" });
  }
});

// add likes
router.put("/likes/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    const user = await User.findById(req.body.userId).exec();

    const blogLikes = blog?.likes.map((item) => item.userId);

    // the user has already liked
    if (blogLikes?.includes(req.body.userId)) {
      const updateLikes = blog.likes.filter(
        (like) => like.userId !== req.body.userId
      );
      await Blog.findByIdAndUpdate(req.params.id, { likes: updateLikes });

      const updateLikeBlogs = user?.likedBlogs?.filter(
        (like) => like.blogId !== req.params.id
      );

      await User.findByIdAndUpdate(req.body.userId, {
        likedBlogs: updateLikeBlogs,
      });
      res
        .status(200)
        .send({ status: "200", message: "Successfully Removed Like" });
    } else {
      const updateLikes = [
        ...blog.likes,
        { userId: req.body.userId, date: Date.now() },
      ];
      await Blog.findByIdAndUpdate(req.params.id, { likes: updateLikes });

      const updateLikeBlogs = [
        ...user.likedBlogs,
        { blogId: req.params.id, date: Date.now() },
      ];

      await User.findByIdAndUpdate(req.body.userId, {
        likedBlogs: updateLikeBlogs,
      });
      res
        .status(200)
        .json({ status: "200", message: "Successfully Added Like" });
    }
  } catch (error) {
    res.status(500).json({ status: "400", message: "Internal Servor Error" });
  }
});

// save posts
router.put("/savedposts/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    const user = await User.findById(req.body.userId).exec();

    const blogSaves = blog?.saved.map((item) => item.userId);

    // the user has already liked
    if (blogSaves?.includes(req.body.userId)) {
      const updateSaves = blog.saved.filter(
        (like) => like.userId !== req.body.userId
      );
      await Blog.findByIdAndUpdate(req.params.id, { saved: updateSaves });

      const updateSavedBlogs = user?.savedBlogs?.filter(
        (like) => like.blogId !== req.params.id
      );

      await User.findByIdAndUpdate(req.body.userId, {
        savedBlogs: updateSavedBlogs,
      });
      res
        .status(200)
        .send({ status: "200", message: "Successfully Removed Bookmark" });
    } else {
      const updateSaves = [
        ...blog.saved,
        { userId: req.body.userId, date: Date.now() },
      ];
      await Blog.findByIdAndUpdate(req.params.id, { saved: updateSaves });

      const updateSavedBlogs = [
        ...user.savedBlogs,
        { blogId: req.params.id, date: Date.now() },
      ];

      await User.findByIdAndUpdate(req.body.userId, {
        savedBlogs: updateSavedBlogs,
      });
      res
        .status(200)
        .json({ status: "200", message: "Successfully Added Bookmark" });
    }
  } catch (error) {
    res.status(500).json({ status: "400", message: "Internal Servor Error" });
  }
});

router.get("/myblogs/:id", async (req, res) => {
  try {
    const results = await Blog.find({
      userId: req.params.id,
    }).select({ userId: 1, title: 1, desc: 1, tags: 1, type: 1, date: 1 });
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// get blog by id
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).select({
      userId: 1,
      title: 1,
      desc: 1,
      tags: 1,
      type: 1,
      date: 1,
      content: 1,
      likes: 1,
      comments: 1,
    });
    res.status(200).send({ status: "200", message: blog });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

router.get("/by-uname/:id", async (req, res) => {
  try {
    const blogs = await Blog.find({ uname: req.params.id }).select({
      userId: 1,
      title: 1,
      desc: 1,
      tags: 1,
      type: 1,
      date: 1,
      content: 1,
      likes: 1,
      // comments: 1,
    });
    res.status(200).send({ status: "200", message: blogs });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

router.get("/by-uname-published/:id", async (req, res) => {
  try {
    const blogs = await Blog.find({ uname: req.params.id })
      .select({
        userId: 1,
        title: 1,
        desc: 1,
        tags: 1,
        type: 1,
        date: 1,
        content: 1,
        likes: 1,
      })
      .sort({ date: -1 })
      .where("type")
      .equals("PUBLISHED");
    res.status(200).send({ status: "200", message: blogs });
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

router.delete("/:id", async (req, res) => {
  try {
    // await Blog.findOneAndDelete({ id: req.params.id.toString() });
    await Blog.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ status: "200", message: "Successfully Deleted the Blog" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

module.exports = router;
