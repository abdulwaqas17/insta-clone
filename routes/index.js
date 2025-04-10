var express = require('express');
var router = express.Router();
const upload = require('./multer');
const postsModel = require('./posts');
const storyModel = require('./story');

var userModel = require('./users');
const passport = require('passport');

// is se hum allow kr rhay hn k, koi banda username aur passward ki basis pr account bna saky
const localStrategy = require('passport-local');

// yhn pr hum login krnay ki strategy bta rhay hn kis k basie pr login krna h (username & password) ki basis pr
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req,res) {
  res.render('index', {footer:false})
})

router.get('/login', function(req,res) {
  res.render('login', {footer:false})
})

router.get('/feed',isLoggedIn, async function(req,res) { 
  // const posts1 = await postsModel.find();
  // console.log(posts1);
  const userData = await userModel.findOne({username:req.session.passport.user});
  // console.log(userData.stories[0]._id);
  const posts = await postsModel.find().populate('user');
  if (userData.stories.length > 0) {

    // $ne means is k ilawa sari a jyn
  let stories = await storyModel.find({_id : {$ne : userData.stories[0]._id}}).populate('user');
  res.render('feed', {footer:true , posts, stories, userData});

  } else {
    let stories = await storyModel.find().populate('user');
    res.render('feed', {footer:true , posts, stories, userData});
  }
  // console.log(posts);
  // console.log(stories);
 
  
})

router.get('/profile',isLoggedIn, async function(req,res) {

  const userData = await userModel.findOne({username:req.session.passport.user}).populate('posts');
  console.log(userData);


  res.render('profile', {footer:false , userData : userData})
})

router.get('/search',isLoggedIn, function(req,res) {
  
  res.render('search', {footer:false})
})

router.get("/upload", isLoggedIn, async function (req, res) {
  
  res.render("upload", { footer: true });
});


router.post("/post",isLoggedIn,upload.single('image'), async function(req,res){

  const userData = await userModel.findOne({username:req.session.passport.user});

  if(req.body.category === 'post') {

    const post = await postsModel.create({
      picture : req.file.filename,
      caption : req.body.caption,
      user : userData._id
    })

    userData.posts.push(post._id); 

  } else if (req.body.category === 'story') {
    
    // for first time story
    if(userData.stories.length < 1) {
      const story = await storyModel.create({
        storyPic : req.file.filename,
        caption : req.body.caption,
        user : userData._id 
      })

      userData.stories.push(story._id);

    } else {
      const story = await storyModel.findOneAndUpdate(
      {_id : userData.stories[0]._id},
      {
        storyPic : req.file.filename,
        caption : req.body.caption,
        user : userData._id
      })

    // in do lines ki sahyad need nhe h
    const storyIndex = userData.stories.findIndex(id => id.toString() === userData.stories[0]._id.toString());
    userData.stories.splice(storyIndex, 1, story._id);


      // userData.stories.splice( indexOf(userData.stories[0]._id.toSting()),1,story._id);
    }

    
  }

  await userData.save();
  res.redirect("/feed")

}) 

router.get("/like/post/:id",isLoggedIn, async function(req,res){

  const user = await userModel.findOne({username : req.session.passport.user});
  const post = await postsModel.findOne({_id : req.params.id}); // require post mil gye gi is me

  // if already like so remove it
  if(post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } 
  // if no like yet,So like it
  else {

    // post.likes.splice(khn se start krna h, kitnay delete krnay hn, kia add krna h)
    post.likes.splice(post.likes.indexOf(user._id),1)

  }

  await post.save();

  res.redirect('/feed')

 

})

router.get('/edit',isLoggedIn, async function(req,res) {

  console.log(req.session);
  // [req.session.passport.user] .user se likhna h q k passport by dafulat yehi key set krta h
  const userData = await userModel.findOne({username:req.session.passport.user});
  console.log(userData);

  res.render('edit', {footer:false , userData})
})


router.post('/update',upload.single('image'), async function(req,res) {

 
  // const userData = await userModel.findOneAndUpdate(unique,data,{new:true});
  const userData = await userModel.findOneAndUpdate(
    // req.session.passport.user → Session se currently logged-in user ka username le raha hai.
    {username : req.session.passport.user},
    {
      username : req.body.username, 
      name : req.body.name,
      bio : req.body.bio
    },
    {new:true});

    if (req.file) {

      userData.profileImage = req.file.filename;
      
    }
    await userData.save();
    res.redirect("/profile")

})


router.get("/username/:username", isLoggedIn , async function(req,res){
  const regex = new RegExp(`^${req.params.username}`, "i");

  const users = await userModel.find({username : regex});

  res.json(users);


})


// for registration
router.post('/register', function(req,res,next){

  const {username,name,email,profileImage,posts,password} = req.body;

  const userData = new userModel({
    username,
    name,
    email,
    // password, password store nhe krwaty, PRIVACY
    // profileImage, 
    // posts
  });

  // userModel.register(userCollectionKaInstance, aurUsInstanceKaPassword) ye account bna rha h
  // userData ko collection m store kry ga, password ko hash kr k
  userModel.register(userData,password)
  .then(function(){
    passport.authenticate("local")(req,res, function(){
      res.redirect('/profile')
    })
  })
})


// for follower
router.get("/follow/:userid", isLoggedIn, async function (req, res) {
  let followKarneWaala = await userModel.findOne({
    username: req.session.passport.user,
  });

  let followHoneWaala = await userModel.findOne({ _id: req.params.userid });

  if (followKarneWaala.following.indexOf(followHoneWaala._id) !== -1) {
    let index = followKarneWaala.following.indexOf(followHoneWaala._id);
    followKarneWaala.following.splice(index, 1);

    let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
    followHoneWaala.followers.splice(index2, 1);
  } else {
    followHoneWaala.followers.push(followKarneWaala._id);
    followKarneWaala.following.push(followHoneWaala._id);
  }

  await followHoneWaala.save();
  await followKarneWaala.save();

  //User ko usi page par wapas bhejta hai jahan se wo request bhej kar aaya tha.
  res.redirect("back"); 
});





// another user profile 
router.get("/profile/:user", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (user.username === req.params.user) {
    res.redirect("/profile");
  }

  let userprofile = await userModel
    .findOne({ username: req.params.user })
    .populate("posts");

  res.render("userprofile", { footer: true, userprofile, user });
});




// for saved
router.get("/save/:postid", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (user.saved.indexOf(req.params.postid) === -1) {
    user.saved.push(req.params.postid);
  } else {
    var index = user.saved.indexOf(req.params.postid);
    user.saved.splice(index, 1);
  }
  await user.save();
  res.redirect('/feed')
});





// for login
// passport.authenticate("local") ==> username aur password ki basis pr login krnay ki koshih kro
router.post("/login",passport.authenticate("local", {
  successRedirect : "/profile",
  failureRedirect : "/login"
}),function (req,res){})



// for logout 
router.get("/logout", function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})


// for isLoggedIn (Middleware Function), ye humaray routes ko protected routes bna dega
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}

module.exports = router;  // export routes

/* 

// var express = require("express");
// var router = express.Router();
// const passport = require("passport");
// const localStrategy = require("passport-local");
// const userModel = require("./users");
// const postModel = require("./posts");
// const storyModel = require("./story");
// passport.use(new localStrategy(userModel.authenticate()));
// const upload = require("./multer");
// const utils = require("../utils/utils");


// // GET
// router.get("/", function (req, res) {
//   res.render("index", { footer: false });
// });

// router.get("/login", function (req, res) {
//   res.render("login", { footer: false });
// });

// router.get("/like/:postid", async function (req, res) {
//   const post = await postModel.findOne({ _id: req.params.postid });
//   const user = await userModel.findOne({ username: req.session.passport.user });
//   if (post.like.indexOf(user._id) === -1) {
//     post.like.push(user._id);
//   } else {
//     post.like.splice(post.like.indexOf(user._id), 1);
//   }
//   await post.save();
//   res.json(post);
// });

// router.get("/feed", isLoggedIn, async function (req, res) {
//   let user = await userModel
//     .findOne({ username: req.session.passport.user })
//     .populate("posts");

//   let stories = await storyModel.find({ user: { $ne: user._id } })
//   .populate("user");

//   var uniq = {};
//   var filtered = stories.filter(item => {
//     if(!uniq[item.user.id]){
//       uniq[item.user.id] = " ";
//       return true;
//     }
//     else return false;
//   })

//   let posts = await postModel.find().populate("user");

//   res.render("feed", {
//     footer: true,
//     user,
//     posts,
//     stories: filtered,
//     dater: utils.formatRelativeTime,
//   });
// });

// router.get("/profile", isLoggedIn, async function (req, res) {
//   let user = await userModel
//     .findOne({ username: req.session.passport.user })
//     .populate("posts")
//     .populate("saved");
//   console.log(user);

//   res.render("profile", { footer: true, user });
// });

// router.get("/profile/:user", isLoggedIn, async function (req, res) {
//   let user = await userModel.findOne({ username: req.session.passport.user });

//   if (user.username === req.params.user) {
//     res.redirect("/profile");
//   }

//   let userprofile = await userModel
//     .findOne({ username: req.params.user })
//     .populate("posts");

//   res.render("userprofile", { footer: true, userprofile, user });
// });

// router.get("/follow/:userid", isLoggedIn, async function (req, res) {
//   let followKarneWaala = await userModel.findOne({
//     username: req.session.passport.user,
//   });

//   let followHoneWaala = await userModel.findOne({ _id: req.params.userid });

//   if (followKarneWaala.following.indexOf(followHoneWaala._id) !== -1) {
//     let index = followKarneWaala.following.indexOf(followHoneWaala._id);
//     followKarneWaala.following.splice(index, 1);

//     let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
//     followHoneWaala.followers.splice(index2, 1);
//   } else {
//     followHoneWaala.followers.push(followKarneWaala._id);
//     followKarneWaala.following.push(followHoneWaala._id);
//   }

//   await followHoneWaala.save();
//   await followKarneWaala.save();

//   res.redirect("back");
// });

// router.get("/search", isLoggedIn, async function (req, res) {
//   let user = await userModel.findOne({ username: req.session.passport.user });
//   res.render("search", { footer: true, user });
// });

// router.get("/save/:postid", isLoggedIn, async function (req, res) {
//   let user = await userModel.findOne({ username: req.session.passport.user });

//   if (user.saved.indexOf(req.params.postid) === -1) {
//     user.saved.push(req.params.postid);
//   } else {
//     var index = user.saved.indexOf(req.params.postid);
//     user.saved.splice(index, 1);
//   }
//   await user.save();
//   res.json(user);
// });

// router.get("/search/:user", isLoggedIn, async function (req, res) {
//   const searchTerm = `^${req.params.user}`;
//   const regex = new RegExp(searchTerm);

//   let users = await userModel.find({ username: { $regex: regex } });

//   res.json(users);
// });

// router.get("/edit", isLoggedIn, async function (req, res) {
//   const user = await userModel.findOne({ username: req.session.passport.user });
//   res.render("edit", { footer: true, user });
// });

// router.get("/upload", isLoggedIn, async function (req, res) {
//   let user = await userModel.findOne({ username: req.session.passport.user });
//   res.render("upload", { footer: true, user });
// });

// router.post("/update", isLoggedIn, async function (req, res) {
//   const user = await userModel.findOneAndUpdate(
//     { username: req.session.passport.user },
//     { username: req.body.username, name: req.body.name, bio: req.body.bio },
//     { new: true }
//   );
//   req.login(user, function (err) {
//     if (err) throw err;
//     res.redirect("/profile");
//   });
// });

// router.post(
//   "/post",
//   isLoggedIn,
//   upload.single("image"),
//   async function (req, res) {
//     const user = await userModel.findOne({
//       username: req.session.passport.user,
//     });

//     if (req.body.category === "post") {
//       const post = await postModel.create({
//         user: user._id,
//         caption: req.body.caption,
//         picture: req.file.filename,
//       });
//       user.posts.push(post._id);
//     } else if (req.body.category === "story") {
//       let story = await storyModel.create({
//         story: req.file.filename,
//         user: user._id,
//       });
//       user.stories.push(story._id);
//     } else {
//       res.send("tez mat chalo");
//     }

//     await user.save();
//     res.redirect("/feed");
//   }
// );

// router.post(
//   "/upload",
//   isLoggedIn,
//   upload.single("image"),
//   async function (req, res) {
//     const user = await userModel.findOne({
//       username: req.session.passport.user,
//     });
//     user.picture = req.file.filename;
//     await user.save();
//     res.redirect("/edit");
//   }
// );

// // POST

// router.post("/register", function (req, res) {
//   const user = new userModel({
//     username: req.body.username,
//     email: req.body.email,
//     name: req.body.name,
//   });

//   userModel.register(user, req.body.password).then(function (registereduser) {
//     passport.authenticate("local")(req, res, function () {
//       res.redirect("/profile");
//     });
//   });
// });

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/feed",
//     failureRedirect: "/login",
//   }),
//   function (req, res) {}
// );

// router.get("/logout", function (req, res) {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     res.redirect("/login");
//   });
// });

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   } else {
//     res.redirect("/login");
//   }
// }

// module.exports = router;

*/