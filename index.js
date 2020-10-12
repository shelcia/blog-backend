const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

//JSON WEB TOKEN REQUISITIES
const jwt = require("jsonwebtoken");
const verify = require("./verify");


const dotenv = require("dotenv");
const PORT = process.env.PORT || 4000;

//VALIDATION OF USER INPUTS PREREQUISITES

const Joi = require("@hapi/joi");

const Blog = require("./models/Blog");
const User = require("./models/User");

dotenv.config();

//CONNECTION TO DATABASE

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log("connected to db  ")
);

//MIDDLEWARE

app.use(express.json(), cors());


//AUTHORISATION RELATED API

//REGISTER SCHEMA
const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });

//LOGIN SCHEMA
const loginSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
});

app.post("/register", async(req,res)=>{

   //CHECK IF MAIL ALREADY EXISTS

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) res.status(400).send({ message: "Email Already Exists" });

  //HASHING THE PASSWORD

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    if (error) res.status(400).send(error);
    //THE USER IS ADDED
    else {
      await user.save();
      res.status(200).send({ message: "user created" });
    }
  } catch (error) {
    res.status(400).send(error);
  }

})

//SIGNIN USER

app.post("/signin", async (req, res) => {
  //CHECKING IF EMAIL EXISTS

  const user = await User.findOne({ email: req.body.email });
  if (!user) res.status(400).send({ message: 'Email doesn"t exist' });

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword)
    res.status(400).send({ message: "Incorrect Password !!!" });

  try {
    const { error } = await loginSchema.validateAsync(req.body);
    if (error) return res.status(400).send({ message: error });
    else {
      //CREATE TOKEN
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res
        .status(200)
        .header("auth-token", token)
        .send({ token: token, userId: user._id, name:user.name });
    }
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

//USER DETAILS API

app.get("/userdetails/:id", async (req, res) => {
  try {
    const results = await User.findOne({
      _id: req.params.id.toString(),
    }).exec();
    res.status(200).send(results);
  } catch (error) {
    res.status(404).send({ message: "Error" });
  }
});

//EDIT USER DETAILS

app.put("/userdetails/edit/:id", async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.params.id.toString() },
      { name: req.body.name }
    );
    res.status(200).send({ message: "successfull" });
  } catch (error) {
    console.log(error);
  }
});


//BLOG RELATED API

//BLOG SCHEMA
const blogSchema = Joi.object({
     id: Joi.string().required(),
     userId: Joi.string().required(),
     title: Joi.string().required(),
     content: Joi.string().required(),
     likes: Joi.required(),
     dislikes: Joi.required(),
     hearts: Joi.required(),
     comments: Joi.array(),
     category:Joi.string().required(),
     image:Joi.string().required(),
});


app.get("/blog", async (req, res) => {
  try {
    const results = await Blog.find().exec();
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Error" });
  }
});

app.get("/blog/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ id: req.params.id.toString() }).exec();
    res.status(200).send(blog);
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Error" });
  }
});

app.post("/blog", async (req, res) => {
  const { error } = await blogSchema.validateAsync(req.body);
  if (error) return res.status(400).send(error);

  const blog = new Blog({
    id: req.body.id,
    userId: req.body.userId,
    title: req.body.title,
    content: req.body.content,
    likes: req.body.likes,
    dislikes: req.body.dislikes,
    hearts: req.body.hearts,
    comments: req.body.comments,
    category:req.body.category,
    image:req.body.image
  });
  try {
    await blog.save();
    res.status(200).send({ message: "successfully created" });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Error" });
  }
});

app.put("/comments/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ id: req.params.id.toString() }).exec();
    blog.set(req.body);
    const result = await blog.save();
    res.send(result);
  } catch (error) {
    res.status(500).send(blog);
  }
});

app.put("/likes/:id", async (req, res) => {
  try {
    await Blog.findOneAndUpdate(
      { id: req.params.id.toString() },
      { likes: req.body.likes }
    );
    res.status(200).send({ message: "successfull" });
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

app.put("/dislikes/:id", async (req, res) => {
  try {
    await Blog.findOneAndUpdate(
      { id: req.params.id.toString() },
      { dislikes: req.body.dislikes }
    );
    res.status(200).send({ message: "successfull" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/hearts/:id", async (req, res) => {
  try {
    await Blog.findOneAndUpdate(
      { id: req.params.id.toString() },
      { hearts: req.body.hearts }
    );
    res.status(200).send({ message: "successfull" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/myblogs/:id", async (req, res) => {
  try {
    const results = await Blog.find({
      userId: req.params.id.toString(),
    }).exec();
    res.status(200).send(results);
  } catch (error) {
    res.status(404).send({ message: "Error" });
  }
});

app.put("/myblogs/edit/:id", async (req, res) => {
  try {
    await Blog.findOneAndUpdate(
      { id: req.params.id.toString() },
      { title: req.body.title, content: req.body.content, image: req.body.image }
    );
    res.status(200).send({ message: "successfull" });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/myblogs/delete/:id", async (req, res) => {
  try {
    await Blog.findOneAndDelete(
      { id: req.params.id.toString() },
    );
    res.status(200).send({ message: "successfull" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/featuredpost", async (req, res) => {
  try {
    const results = await Blog.sort("likes").exec()
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));


// {
//     "id": "1234455555",
//     "userId": "5f820689954d8a3a070bc2f9",
//     "title": "My New Blog",
//     "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
//     "likes": 0,
//     "dislikes": 0,
//     "hearts": 0,
//     "comments": [],
//     "category":"Web Development"
// }

// https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png