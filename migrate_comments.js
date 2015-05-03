var mongoose = require('mongoose');
mongoose.connect('mongodb://readitlive:HR14Rules@proximus.modulusmongo.net:27017/Y8jyguwu');
var db = mongoose.connection;

var R = require('ramda');

var commentsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.Mixed,
  commentText: String,
  author: String,
  eventId: String,
  time: Date
});

var commentsSchemav2 = new mongoose.Schema({
  postText: String,
  author: String,
  eventId: String,
  time: Date,
  avatarUrl: String,
  timeEU: String
});

db.on('error', console.error);

db.once('open', function() {
  var oldComments = mongoose.model('Comments', commentsSchema);
  var Comments = mongoose.model('Comments.v2', commentsSchemav2);

  oldComments.find(function(err, comments) {
    if (err) {
      console.log(err);

    }

    R.forEach(function(oldComment) {
      console.log('migrating oldComment: ', oldComment.username);
      var newComment = new Comments({
        postText: oldComment.commentText,
        author: oldComment.author,
        eventId: oldComment.eventId,
        time: oldComment.time
      });
      console.log(newComment);
      newComment.save(function(err, savedComment) {
        if (err) {
          console.log(err);
        } else {
          console.log('saved: ', savedComment);

        }
      });

    }, comments);
  });

});
