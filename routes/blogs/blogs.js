const router = require("express").Router();

const Joi = require("joi");
const { handleImageUpload } = require("../../middleware/handleImgUpload");
const Blog = require("../../models/Blog");

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

router.get("/featuredposts", async (req, res) => {
  try {
    // const results = await Blog.find({}).where("type").equals("PUBLISHED");
    const results = await Blog.find({})
      .sort("likes")
      .where("type")
      .equals("PUBLISHED")
      .limit(3);

    // console.log(results);
    res.status(200).send({ status: "200", message: results });
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

// get all blogs
router.get("/", async (req, res) => {
  try {
    const results = await Blog.find({});
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    // console.log(error);
    res.status(200).send({ status: "500", message: "Error" });
  }
});

// get blog by id
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    res.status(200).send({ status: "200", message: blog });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "500", message: "Error" });
  }
});

router.post("/", handleImageUpload, async (req, res) => {
  try {
    console.log(req.body);
    const { error } = await blogSchema.validateAsync(req.body);
    if (error) {
      res.status(200).send({ status: "400", message: error });
      return;
    }

    let updatedBlog = req.body;

    if (req.file) updatedBlog.image = req.file.buffer;
    updatedBlog.comments = [];
    updatedBlog.likes = 0;
    updatedBlog.tags = JSON.parse(updatedBlog.tags);

    const blog = new Blog(updatedBlog);
    await blog.save();
    res.status(200).send({ status: "200", message: "Successfully Created" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// add comments
router.put("/comments/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ id: req.params.id.toString() }).exec();
    blog.set(req.body);
    const result = await blog.save();
    res.send(result);
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

// add likes
router.put("/likes/:id", async (req, res) => {
  try {
    await Blog.findOneAndUpdate(
      { id: req.params.id.toString() },
      { likes: req.body.likes }
    );
    res.status(200).send({ status: "200", message: "Successfully Added Like" });
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
