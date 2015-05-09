var mongoose = require('mongoose');
mongoose.connect('mongodb://readitlive:HR14Rules@c194.capital.3.mongolayer.com:10194/ril');
var db = mongoose.connection;

var R = require('ramda');

var usersSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.Mixed,
  username: String,
  services: {
    password: {bcrypt: String}
  },
  profile: {name: String},
  avatarUrl: String
});

var usersSchemav2 = new mongoose.Schema({
  username: String,
  passwordHash: String,
  profile: {
    name: String,
    avatarUrl: String,
    email: String
  }
});

db.on('error', console.error);

db.once('open', function() {
  oldUsers = mongoose.model('Users', usersSchema);
  Users = mongoose.model('UsersV2', usersSchemav2);

  oldUsers.find(function(err, users) {
    if (err) {
      console.log(err);

    }

    R.forEach(function(oldUser) {
      console.log('migrating oldUser: ', oldUser.username);
      var ops = oldUser;
      console.log(ops);
      delete ops._id;
      delete ops.id;
      var newUser = new Users({
        username: ops.username,
        passwordHash: ops.services.password.bcrypt,
        profile:  {
          avatarUrl: ops.avatarUrl,
          name: ops.profile && ops.profile.name
        }
      });
      console.log(newUser);
      newUser.save(function(err, savedUser) {
        if (err) {
          console.log(err);
        } else {
          console.log('saved: ', savedUser.username);

        }
      });

    }, users);
  });

});
