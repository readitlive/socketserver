var R = require('ramda');
var db = require('../db/setup');
var bcrypt = require('bcrypt');
var sha256 = require('sha256');

var _bcryptRounds = 10;

exports.genHash = function (password) {
  return bcrypt.hashSync(sha256(password), _bcryptRounds);
};

exports.validatePassword = function(user, password) {
  return bcrypt.compareSync(sha256(password), user.passwordHash);
};

exports.checkAdmin = function(req, res, next) {
  console.log('checking admin')

  db.Events.findById(req.params.eventId, function(err, event) {
    if (err) {
      console.log(err);
      res.sendStatus(400);
    }

    console.log('user ', req.user.username);
    console.log('admins ', req.user.username);
    var index = R.indexOf(req.user.username, event.adminUsers);
    if (index >= 0) {
      next();
    } else {
      res.sendStatus(401);
    }
  });
};
