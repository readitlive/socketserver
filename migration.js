var mongoose = require('mongoose');
mongoose.connect('mongodb://readitlive:HR14Rules@proximus.modulusmongo.net:27017/Y8jyguwu');
var db = mongoose.connection;

var R = require('ramda');

var eventsSchema = new mongoose.Schema({
  eventTitle: String,
  createdBy: String,
  adminUsers: [ String ],
  eventIsLive: Boolean,
  time: Date
});

var postsSchema = new mongoose.Schema({
  postText: String,
  author: String,
  eventId: String,
  time: Date,
  postIsComment: Boolean,
  avatarUrl: String,
  timeEU: String
});

db.on('error', console.error);

db.once('open', function() {
  db.Events = mongoose.model('Events', eventsSchema);
  db.Posts = mongoose.model('Posts', postsSchema);

  db.Events.find(function(err, events) {
    if (err) {
      console.log(err);

    }

    R.forEach(function(oldEvent) {
      console.log('migrating oldEvent: ', oldEvent.eventTitle);
      var ops = oldEvent;
      console.log(ops);
      delete ops._id;
      delete ops.id;
      var newEvent = new db.Events({
        eventTitle: ops.eventTitle,
        createdBy: ops.createdBy,
        adminUsers: ops.adminUsers,
        eventIsLive: ops.eventIsLive,
        time: ops.time
      });
      console.log(newEvent);
      newEvent.save(function(err, savedEvent) {
        if (err) {
          console.log(err);
        } else {
          console.log('saved: ', savedEvent.eventTitle);

          // db.Posts.find({eventId: oldEvent._id}, function(err, posts) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     R.forEach(function(oldPost) {
          //       console.log('old eventId: ', oldPost.eventId);
          //       console.log('new eventId: ', savedEvent.eventId);
          //       oldPost.eventId = savedEvent._id;
          //       oldPost.save();
          //     }, posts);
          //   }
          //
          // });

          oldEvent.remove(function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log('delete success: ', oldEvent.eventTitle);
            }
          });
        }
      });
    }, events);
  });

});
