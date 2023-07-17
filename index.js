const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const session = require("express-session");
const { createClient } = require("redis");
const RedisStore = require("connect-redis").default;

const dotenv = require("dotenv");
const PORT = process.env.PORT || 8000;

//IMPORT ROUTES

const authRoute = require("./routes/auth/auth");
const blogRoute = require("./routes/blogs/blogs");
const userRoute = require("./routes/user/user");

dotenv.config();

//CONNECTION TO DATABASE

//CONNECTION TO DATABASE
mongoose.connect(process.env.DB_CONNECT);
// mongoose.connect(
//   process.env.DB_CONNECT,
//   {
//     useCreateIndex: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//   },
//   () => console.log("connected to db  ")
// );

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//MIDDLEWARE

app.use(express.json(), cors());

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// Initialize client.
let redisClient = createClient({
  username: "shelcia",
  password: process.env.REDIS_PWD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 15247,
  },
});
redisClient.connect().catch(console.error);

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

// Initialize sesssion storage.
app.use(
  session({
    store: redisStore,
    secret: "my_session_secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
      // Only set to true if you are using HTTPS.
      // Secure Set-Cookie attribute.
      secure: true,
      // Only set to true if you are using HTTPS.
      httpOnly: false,
      // Session max age in milliseconds. (1 min)
      // Calculates the Expires Set-Cookie attribute
      maxAge: 60000,
    },
  })
);

// app.use(
//   session({
//     store: redisStore,
//     resave: false, // required: force lightweight session keep alive (touch)
//     saveUninitialized: false, // recommended: only save session when data exists
//     secret: "keyboard cat",
//   })
// );

// const client = createClient({
//   username: "shelcia",
//   password: process.env.REDIS_PWD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: 15247,
//   },
// });

// client.on("error", (err) => console.log("Redis Client Error", err));

// const redisFunc = async () => {
//   try {
//     await client.connect();

//     await client.set("key", "value");
//     const value = await client.get("key");
//     console.log(value);
//     await client.disconnect();
//     v;
//   } catch (err) {}
// };

// redisFunc();

// app.use(
//   session({ secret: "Your_Secret_Key", resave: true, saveUninitialized: true })
// );
// app.use(
//   session({
//       store:new RedisStore({client:client}),
//       secret: "my_session_secret",
//       resave: true,
//       saveUninitialized: false,
//       cookie:{
//           // Only set to true if you are using HTTPS.
//           // Secure Set-Cookie attribute.
//           secure:true,
//           // Only set to true if you are using HTTPS.
//           httpOnly:false,
//           // Session max age in milliseconds. (1 min)
//           // Calculates the Expires Set-Cookie attribute
//           maxAge:60000
//       }
//   })
// );

//ROUTE MIDDLEWARE

app.use("/api/auth", authRoute);
app.use("/api/blog", blogRoute);
app.use("/api/user", userRoute);

app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));

app.get("/", (req, res) => {
  res.send(`<p>Hey! It's working</p>`);
});
