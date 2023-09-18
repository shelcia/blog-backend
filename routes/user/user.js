const router = require("express").Router();

const { handleImageUpload } = require("../../middleware/handleImgUpload");
const User = require("../../models/User");

router.get("/all", async (req, res) => {
  try {
    const results = await User.find({}).select({
      name: 1,
      email: 1,
      likedBlogs: 1,
      savedBlog: 1,
    });
    res.status(200).json({ status: "200", message: results });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ status: "500", message: "Error" });
  }
});

router.get("/getnameavatar/:id", async (req, res) => {
  try {
    const results = await User.findById(req.params.id)
      .select({ avatar: 1, name: 1 })
      .exec();
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Error" });
  }
});

//USER DETAILS API

router.get("/:id", async (req, res) => {
  try {
    const results = await User.findById(req.params.id)
      .select({
        name: 1,
        // avatar: 1,
        desc: 1,
        email: 1,
        // likedBlogs: 1,
        // savedBlogs: 1,
        date: 1,
      })
      .exec();
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Error" });
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    const results = await User.findById(req.params.id)
      .select({
        name: 1,
        email: 1,
        likedBlogs: 1,
        savedBlogs: 1,
      })
      .exec();
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Error" });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    const result = await User.findById(req.params.id);
    res.set("Content-Type", "image/jpeg");
    res.status(200).send(result.image);
  } catch (error) {
    res.status(200).send({ status: "400", message: error });
  }
});

//EDIT USER DETAILS

router.put("/edit/:id", handleImageUpload, async (req, res) => {
  let updatedUser = req.body;
  try {
    if (req.file) updatedUser.image = req.file.buffer;
    const user = await User.findById(req.params.id).exec();
    user.set(updatedUser);
    await user.save();
    res
      .status(200)
      .send({ status: "200", message: "Successfully Edited Profile" });
  } catch (error) {
    res.status(500).json({ status: "500", message: "Internal Servor Error" });
  }
});

router.get("/by-uname/:id", async (req, res) => {
  try {
    const results = await User.findOne({ uname: req.params.id })
      .select({
        name: 1,
        desc: 1,
        email: 1,
        date: 1,
      })
      .exec();
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Error" });
  }
});

// router.get("/edit/:id", async (req, res) => {
//   try {
//     await User.findOneAndUpdate(
//       { _id: req.params.id.toString() },
//       { name: req.body.name, avatar: req.body.avatar }
//     );
//     res
//       .status(200)
//       .send({ status: "200", message: "Successfully Edited Profile" });
//   } catch (error) {
//     console.log(error);
//     res.status(200).send({ status: "400", message: "Error" });
//   }
// });

module.exports = router;
