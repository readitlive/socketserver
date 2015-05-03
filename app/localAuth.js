//jwt middleware. Validates the token.

var bcrypt = require('bcrypt');

var sha256 = require('sha256');

var _bcryptRounds = 10;

var genHash = function (password) {
  return bcrypt.hashSync(sha256(password), _bcryptRounds);
};

exports.validatePassword = function(user, password) {
  return bcrypt.compareSync(sha256(password), user.passwordHash);

};

exports.genHash = genHash;
