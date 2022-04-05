const multer = require("multer");

//SETTING UP FOR IMAGE UPLOADS

const upload = multer({
  limits: {
    fileSize: 10000000, // max file size 10MB = 10000000 bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      cb(new Error("Only upload files with jpg or jpeg or png format."));
    }
    cb(undefined, true); // continue with upload
  },
}).single("image");

module.exports.handleImageUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      res.status(200).send({
        status: "500",
        message: "A Multer error occurred when uploading",
      });
    } else if (err) {
      res.status(200).send({
        status: "500",
        message: "An unknown error occurred when uploading",
      });
    } else next();
  });
};
