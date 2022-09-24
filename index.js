const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const dotenv = require("dotenv");
const PORT = process.env.PORT || 8000;

//IMPORT ROUTES

const authRoute = require("./routes/auth/auth");
const blogRoute = require("./routes/blogs/blogs");
const userRoute = require("./routes/user/user");

dotenv.config();

//CONNECTION TO DATABASE

//CONNECTION TO DATABASE
mongoose.connect(
  process.env.DB_CONNECT,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  () => console.log("connected to db  ")
);

//MIDDLEWARE

app.use(express.json(), cors());

//ROUTE MIDDLEWARE

app.use("/api/auth", authRoute);
app.use("/api/blog", blogRoute);
app.use("/api/user", userRoute);

app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));

app.get("/", (req, res) => {
  res.send(`<p>Hey! It's working</p>`);
});
