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

app.use(
  express.json(),
  cors({
    origin: "*",
  })
);

//ROUTE MIDDLEWARE

app.use("/api/auth", authRoute);
app.use("/api/blog", blogRoute);
app.use("/api/user", userRoute);

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
