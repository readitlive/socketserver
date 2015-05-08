//jwt middleware. Validates the token.

var jwt = require('jwt-simple');
var db = require('../db/setup');
var moment = require('moment');

var SECRET = 'aVery814491904sevteajlfhp148fmz';

module.exports = {

  encodeToken: function(user) {
    var expiration = moment().add(14, 'days').valueOf();
    var token = jwt.encode({
        iss: user._id,
        exp: expiration
      }, SECRET);
    delete user.passwordHash;
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
        db.Users.findById(decodedToken.iss, function(err, user) {
          req.user = user;
          return next();
        });

      } catch (err) {
        console.log('err decoding token');

        return res.sendStatus(401);
      }
    } else {
      console.log('err no token');
      return res.sendStatus(401);
    }
  }

};
