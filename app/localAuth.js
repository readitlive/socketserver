//jwt middleware. Validates the token.

var bcrypt = require('bcrypt');

var sha256 = require('sha256');

var _bcryptRounds = 10;

var genHash = function (password) {
  password = sha256(password);
  return bcrypt.hashSync(password, _bcryptRounds);
};

exports.validatePassword = function(user, password) {

  return genHash(password) === user.passwordHash;

};

exports.genHash = genHash;
