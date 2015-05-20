var mongoose = require('mongoose');
mongoose.connect('mongodb://readitlive:HR14Rules@c194.capital.3.mongolayer.com:10194/ril');
var db = mongoose.connection;
var R = require('ramda');

var usersSchemav2 = new mongoose.Schema({
  facebookId: String,
  username: String,
  usernameLowercase: String,
  passwordHash: String,
  profile: {
    name: String,
    avatarUrl: String,
    email: String
  }
});

db.on('error', console.error);

db.once('open', function() {
  var Users = mongoose.model('Usersv2', usersSchemav2);

  Users.find(function(err, users) {
    if (err) {
      console.log(err);
    }

    R.forEach(function(oldUser) {
      oldUser.usernameLowercase = oldUser.username.toLowerCase();
      console.log('migrating oldUser: ', oldUser.username, '-> ', oldUser.usernameLowercase);
      oldUser.save(function(err, savedUser) {
        if (err) {
          console.log(err);
        } else {
          console.log('saved: ', savedUser.username);

        }
      });

    }, users);
  });

});
