// const mongoose = require('mongoose');

// const postSchema = mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user"
//   },
//   caption: String,
//   like: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user"
//   }],
//   comments: {
//     type: Array,
//     default: []
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   shares: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user"
//   }],
//   picture: String
// })


// module.exports = mongoose.model("post", postSchema);

// let dotenv = require("dotenv"); // Environment variables read karne ke liye
// dotenv.config();

// let mongoose = require("mongoose");
// let mongoURI = process.env.MONGO_URI; // MongoDB URI environment se le rahe hain
// const plm = require("passport-local-mongoose");

// mongoose.connect(mongoURI)
//   .then(() => console.log("MongoDB Connected Successfully"))
//   .catch(err => console.error("MongoDB Connection Failed", err));
// // console.log('db connected successfully');

// const userSchema = mongoose.Schema({
//   username: String,
//   name: String,
//   email: String,
//   password: String,
//   picture: {
//     type: String,
//     default: "def.png"
//   },
//   contact: String,
//   bio: String,
//   stories: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "story" 
//     }
//   ],
//   saved: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "post" 
//     }
//   ],
//   posts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "post" 
//   }],
//   followers: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user" 
//     } 
//   ],
//   following: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user" 
//     }
//   ]
// })


let mongoose = require("mongoose");

let postSchema = mongoose.Schema({

  picture : String,
  caption : String,
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "users"
  },
  date : {
    type : Date,
    default : Date.now
  },
  likes : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'users'
    }
  ]
 
})


let postsData = mongoose.model('posts', postSchema);
module.exports = postsData; // export collection

/*

user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "users"
  }

Yeh code user field me kisi aur collection (users) ka _id store kar raha hai. Matlab, yeh ek reference (link) hai kisi specific user ke liye, jo users collection me maujood hai.

Agar hum .populate("user") use karein, to MongoDB sirf _id nahi, balki us user ki puri details bhi le aayega.

Example:

Ek blog post ke saath uske author ka _id store hogauser field me.

Jab hum post ko fetch karein .populate("user") ke saath, to pura user ka data bhi mil jayega (naam, email waghera).

Simple words me: Yeh user ka _id store karta hai, lekin populate se pura user ka data fetch ho sakta hai! 🚀

*/