const router = require("express").Router();

const Joi = require("joi");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

router.post("/register", async (req, res) => {
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
      res.status(200).send({ status: 200, message: "user created" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//SIGNIN USER

router.post("/signin", async (req, res) => {
  //CHECKING IF EMAIL EXISTS

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(200).send({ status: "400", message: 'Email doesn"t exist' });
    return;
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    res.status(200).send({ status: "400", message: "Incorrect Password !!!" });
    return;
  }
  const { error } = await loginSchema.validateAsync(req.body);
  if (error) return res.status(200).send({ status: "400", message: error });
  else {
    //CREATE TOKEN
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res
      .status(200)
      .header("auth-token", token)
      .send({ status: "200", token: token, userId: user._id, name: user.name });
  }

  try {
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Server error" });
  }
});

module.exports = router;
