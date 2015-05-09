var R = require('ramda');
var bcrypt = require('bcrypt');
var sha256 = require('sha256');
var db = require('./db/setup');

var _bcryptRounds = 10;

exports.genHash = function (password) {
  return bcrypt.hashSync(sha256(password), _bcryptRounds);
};

exports.validatePassword = function(user, password) {
  return bcrypt.compareSync(sha256(password), user.passwordHash);
};

exports.checkAdmin = function(req, res, next) {
  db.Events.findById(req.params.eventId, function(err, event) {
    if (err) {
      console.log(err);
      res.sendStatus(401);
    }
    if (R.indexOf(req.user.username, event.adminUsers)) { //user is in admins list
      next()
    } else {
      res.sendStatus(401);
    }
  });

};
