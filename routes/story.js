const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  storyPic: String,
  caption: String,
  date: {
    type: Date,
    default: Date.now
  }
})


module.exports = mongoose.model("story", storySchema);