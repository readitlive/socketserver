var mongoose = require('mongoose');
var schemas = require('./schemas');
mongoose.connect('mongodb://readitlive:HR14Rules@proximus.modulusmongo.net:27017/Y8jyguwu');
var db = mongoose.connection;

db.on('error', console.error);

db.once('open', function() {
  db.Events = mongoose.model('Events.v2', schemas.eventsSchema);
  db.Posts = mongoose.model('Posts.v2', schemas.postsSchema);
  db.Comments = mongoose.model('Comments', schemas.commentsSchema);
  db.Users = mongoose.model('Users', schemas.usersSchema);
});


module.exports = db;
