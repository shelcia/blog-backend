const router = require("express").Router();

const Joi = require("joi");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { slugify } = require("../../helpers/helperFunc");
const randomstring = require("randomstring");

//AUTHORISATION RELATED API

//REGISTER SCHEMA
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

router.post("/register", async (req, res) => {
  try {
    //CHECK IF MAIL ALREADY EXISTS

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      res.status(400).json({ status: 400, message: "Email Already Exists" });
      return;
    }

    //HASHING THE PASSWORD

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const uname = `${slugify(req.body.name)}--${randomstring.generate(7)}`;

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      uname: uname,
      password: hashedPassword,
    });

    //VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    if (error) res.status(400).send(error);
    //THE USER IS ADDED
    else {
      await user.save();
      // res.status(200).send({ status: 200, message: "user created" });
      //CREATE TOKEN
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "6h", // expires in 6 hours
      });
      res.status(200).header("auth-token", token).json({
        status: "200",
        token: token,
        userId: user._id,
        name: user.name,
        uname: user.uname,
      });
    }
  } catch (error) {
    // console.log("rrr");
    if (error?.details) {
      res
        .status(400)
        .json({ status: "500", message: error?.details[0]?.message });
    } else {
      res.status(500).json({ status: "500", message: error });
    }
  }
});

//LOGIN SCHEMA
const loginSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

//SIGNIN USER
router.post("/signin", async (req, res) => {
  //CHECKING IF EMAIL EXISTS

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({ status: "400", message: 'Email doesn"t exist' });
    return;
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    res.status(400).json({ status: "400", message: "Incorrect Password !!!" });
    return;
  }
  try {
    const { error } = await loginSchema.validateAsync(req.body);
    if (error) {
      res.status(200).json({ status: "400", message: error });
    } else {
      //CREATE TOKEN
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "6h", // expires in 6 hours
      });

      res.status(200).header("auth-token", token).send({
        status: "200",
        token: token,
        userId: user._id,
        name: user.name,
        uname: user.uname,
      });
    }
  } catch (error) {
    if (error.details) {
      res
        .status(400)
        .send({ status: "400", message: error.details?.[0]?.message });
    } else {
      res.status(500).send({ status: "400", message: error });
    }
  }
});

router.post("/isvalid", async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      res
        .status(401)
        .json({ status: 401, isValid: false, message: "Access Denied" });
      return;
    }
    const dateNow = new Date();
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    if (decodedToken.exp > dateNow.getTime() / 1000) {
      res
        .status(200)
        .json({ status: 200, isValid: true, message: "token valid" });
    } else {
      res
        .status(401)
        .json({ status: 401, isValid: false, message: "token expired" });
    }
  } catch (error) {
    res.status(500).json({ status: "500", isValid: false, message: error });
  }
});

module.exports = router;
