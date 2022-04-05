const router = require("express").Router();

const Joi = require("joi");
const Blog = require("../../models/Blog");

//BLOG SCHEMA
const blogSchema = Joi.object({
  // id: Joi.string().required(),
  userId: Joi.string().required(),
  title: Joi.string().required(),
  desc: Joi.string().required(),
  content: Joi.string().required(),
  likes: Joi.required(),
  comments: Joi.array(),
  tags: Joi.array(),
  type: Joi.string().required(),
});

//BLOG RELATED API

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
    // const blog = await Blog.findOne({ id: req.params.id.toString() }).exec();
    const blog = await Blog.findById(req.params.id).exec();

    res.status(200).send({ status: "200", message: blog });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "500", message: "Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error } = await blogSchema.validateAsync(req.body);
    if (error) {
      res.status(200).send({ status: "400", message: error });
      return;
    }

    // const blog = new Blog({
    //   // id: req.body.id,
    //   userId: req.body.userId,
    //   title: req.body.title,
    //   content: req.body.content,
    //   likes: req.body.likes,
    //   dislikes: req.body.dislikes,
    //   hearts: req.body.hearts,
    //   comments: req.body.comments,
    //   category: req.body.category,
    //   // image: req.body.image,
    // });

    const blog = new Blog(req.body);
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
    console.log(req.params.id.toString());
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

router.get("/featuredposts", async (req, res) => {
  try {
    const results = await Blog.find({});
    console.log(results);
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor Error" });
  }
});

module.exports = router;
