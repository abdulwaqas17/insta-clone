// const multer = require("multer");
// const path = require("path");
// const crypto = require("crypto");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/images/uploads");
//   },
//   filename: function (req, file, cb) {
//     const fn =
//       crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
//     cb(null, fn);
//   },
// });

// const upload = multer({ storage: storage });

const multer = require('multer');
const path = require('path'); // for file extension, in this context
const {v4 : uuidv4} = require('uuid'); // for uinque id

//🔹 File kahan save hogi → ./public/images/uploads folder mein.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {   
    cb(null, './public/images/uploads')
  },
  //🔹 File ka unique naam banaya ja raha hai using UUID + original file extension.
  filename: function (req, file, cb) {
   
    const uinqueFile = uuidv4();

    cb(null, uinqueFile + path.extname(file.originalname) )

  }
})

const upload = multer({ storage: storage });

module.exports = upload;

/*
Ye code **Multer** ko configure kar raha hai taake **file uploads** ko handle kiya ja sake. Jab koi user image ya file upload karega, toh ye code:  

1. **File ko store karne ki jagah (`../public/images/uploads`) set karega.**  
2. **File ka ek unique naam generate karega (`uuidv4() + extension`).**  
3. **Multer middleware ko export karega taake Express routes me use kiya ja sake.**  

Matlab jab bhi koi **image upload karega**, toh ye **safe aur unique name ke sath server ke uploads folder me save ho jayegi**. 🚀
*/

