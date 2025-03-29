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

// userSchema.plugin(plm);

// module.exports = mongoose.model("user", userSchema);

let dotenv = require("dotenv"); // Environment variables read karne ke liye
dotenv.config();

let mongoose = require("mongoose");
let mongoURI = process.env.MONGO_URI; // MongoDB URI environment se le rahe hain
const plm = require("passport-local-mongoose");

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Failed", err));
// console.log('db connected successfully');

let userSchema = mongoose.Schema({
  username : String,
  name : String,
  bio : String,
  email : String,
  password : String,
  profileImage : String, // because q k hum img ka url store krty hn
  posts : [{type : mongoose.Schema.Types.ObjectId , ref : "posts"}], // srif post ki ides store hon gi is m
})


// is se hum serializeUser aur deserializeUser user provide kr rhay hn, jo app.js m import kia h
userSchema.plugin(plm);

let usersData = mongoose.model('users', userSchema);
module.exports = usersData; // export collection