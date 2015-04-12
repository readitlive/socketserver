var mongoose = require('mongoose');
mongoose.connect('mongodb://readitlive:HR14Rules@proximus.modulusmongo.net:27017/Y8jyguwu');
var db = mongoose.connection;

var R = require('ramda');

var eventsSchema = new mongoose.Schema({
  eventTitle: String,
  adminUsers: [ String ],
  eventIsLive: Boolean,
  time: Date
});

db.on('error', console.error);

db.once('open', function() {
  db.Events = mongoose.model('Events', eventsSchema);

  db.Events.find(function(err, events) {
    if (err) {
      console.log(err);

    }

    R.forEach(function(oldEvent) {
      console.log('migrating oldEvent: ', oldEvent.eventTitle);
      var ops = oldEvent;
      ops._id = mongoose.Types.ObjectId();
      var newEvent = new db.Events(ops);
      console.log(newEvent);
      newEvent.save(function(err, savedEvent) {
        if (err) {
          console.log(err);
        } else {
          console.log('saved: ', savedEvent.eventTitle);

          db.Posts.find({eventId: oldEvent._id}, function(err, posts) {
            if (err) {
              console.log(err);
            } else {
              R.forEach(function(oldPost) {
                oldPost.eventId = savedEvent._id;
                oldPost.save();
              }, posts);
            }

          });

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
