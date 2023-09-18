const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

// const fs = require("fs");
// const path = require("path");
// const morgan = require("morgan");

const dotenv = require("dotenv");
const PORT = process.env.PORT || 8000;

//IMPORT ROUTES

const authRoute = require("./routes/auth/auth");
const blogRoute = require("./routes/blogs/blogs");
const userRoute = require("./routes/user/user");

dotenv.config();

//CONNECTION TO DATABASE
// mongoose.connect(process.env.DB_CONNECT);
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server up and running at ${PORT}`));
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );

//MIDDLEWARE

app.use(express.json(), cors());

// setup the logger
// app.use(morgan("combined", { stream: accessLogStream }));

//ROUTE MIDDLEWARE

app.use("/api/auth", authRoute);
app.use("/api/blog", blogRoute);
app.use("/api/user", userRoute);

// app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));

app.get("/", (req, res) => {
  res.send(`<p>Hey! It's working</p>`);
});
