//jwt middleware. Validates the token.

var jwt = require('jwt-simple');
var User = require('../db/setup').User;
var moment = require('moment');

var SECRET = 'aVery814491904sevteajlfhp148fmz';

module.exports = {

  encodeToken: function(user) {
    var expiration = moment().add(14, 'days').valueOf();
    var token = jwt.encode({
        iss: user._id,
        exp: expiration
      }, SECRET);

    return {
      token: token,
      expires: expiration,
      user: user.toJSON()
    };

  },

  checkToken: function(req, res, next) {
    var token = req.headers['access-token'] || (req.body && req.body.access_token);
    if (token) {
      try {
        var decodedToken = jwt.decode(token, SECRET);
        if (decodedToken.exp <= Date.now()) {
          return res.end('login expired', 401);
        }
        User.findOne({_id: decodedToken.iss }, function(err, user) {
          req.user = user;
          return next();
        });

      } catch (err) {
        return res.end(401);
      }
    } else {
      return res.end(401);
    }
  }

};
