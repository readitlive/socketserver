var mongoose = require('mongoose');
var schemas = require('./schemas');
var MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL);
var db = mongoose.connection;

db.on('error', console.error);

db.once('open', function() {
  db.Events = mongoose.model('Events.v2', schemas.eventsSchema);
  db.Posts = mongoose.model('Posts.v2', schemas.postsSchema);
  db.Comments = mongoose.model('Comments.v2', schemas.commentsSchema);
  db.Users = mongoose.model('Users.v2', schemas.usersSchema);
});


module.exports = db;
