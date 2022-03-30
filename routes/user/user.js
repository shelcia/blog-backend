const router = require("express").Router();

const User = require("../../models/User");

//USER DETAILS API

router.get("/:id", async (req, res) => {
  try {
    const results = await User.findById(req.params.id.toString()).exec();
    res.status(200).send({ status: "200", message: results });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Error" });
  }
});

//EDIT USER DETAILS

router.put("/edit/:id", async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.params.id.toString() },
      { name: req.body.name, avatar: req.body.avatar }
    );
    res
      .status(200)
      .send({ status: "200", message: "Successfully Edited Profile" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "400", message: "Error" });
  }
});

module.exports = router;
