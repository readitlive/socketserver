var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var R = require('ramda');

var compress = require('compression');

var socket = require('./socketserver');
var db = require('./db/setup');
var jwtAuth = require('./utils/jwtAuth');
var localAuth = require('./utils/localAuth');
var S3Sign = require('./utils/S3Sign');
var utils = require('./utils/utils');

var passport = require('passport');
// var FacebookStrategy = require('passport-facebook').Strategy;
//
// var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
// var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

db.once('open', function() {

  app.use(bodyParser.json());

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, access-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
    next();
  });

  app.use(compress());
  app.use(express.static(__dirname + '/public'));

  /**
   * Auth routes
   */

  // passport.use(new FacebookStrategy({
  //   clientID: FACEBOOK_APP_ID,
  //   clientSecret: FACEBOOK_APP_SECRET,
  //   callbackURL: "http://readitlive.net/api/auth/facebook/callback"
  // }, function(accessToken, refreshToken, profile, done) {
  //   db.Users.findOrCreate({facebookId: profile.id}, function(err, user) {
  //     //TODO
  //     user.profile.avatarUrl = profile.photos;
  //     user.profile.name = profile.name;
  //     user.profile.email = profile.email;
  //     user.username = profile.email;
  //     user.save(function() {
  //       done();
  //     });
  //   });
  //
  // }));

  app.post('/api/auth/login', function(req, res) {
    db.Users.findOne({username: req.body.username}, function(err, user) {
      if (err) {
        console.log(err);
        console.log('error locating user:', req.body);
        return res.sendStatus(401);
      } else if (!user) {
        console.log('no user found:', req.body);
        return res.status(401).json({message: 'User does not exist.'});
      }

      if (!localAuth.validatePassword(user, req.body.password)) {
        console.log('credentials invalid:', req.body);
        return res.status(401).json({message: 'Wrong password.'});
      } else {
        return res.json(jwtAuth.encodeToken(user));
      }
    });
  });

  app.put('/api/auth/user', jwtAuth.checkToken, function(req, res) {
    if (req.user.username !== req.body.username) return res.sendStatus(403);
    db.Users.findOne({username: req.body.username}, function(err, user) {
      if (err) {
        console.log(err);
        console.log('error locating user:', req.body);
        return res.sendStatus(401);
      } else if (!user) {
        console.log('no user found:', req.body);
        return res.sendStatus(401);
      }
      user.profile.avatarUrl = req.body.profile.avatarUrl;
      user.save(function(err, newUser) {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        } else {
          delete newUser.passwordHash;
          res.json(newUser);
        }
      });
    });
  });

  app.post('/api/auth/signup', function(req, res) {
    if (!(req.body.username && req.body.password)) {
      return res.sendStatus(400);
    }
    db.Users.findOne({username: req.body.username}, function(err, user) {
      if (user) {
        return res.status(400).json({message: 'Sorry, that username is taken.'});
      }
      var newUser = new db.Users({
        username: req.body.username,
        passwordHash: localAuth.genHash(req.body.password),
        profile: {
          email: req.body.email,
          name: req.body.name,
        }
      });

      newUser.save(function(err, user) {
        if (err) {
          console.log('err saving user: ', req.body);
          return res.sendStatus(500);
        } else if (!user) {
          console.log('err no user: ', req.body);
          return res.sendStatus(500);
        }
        console.log('saved user: ', user);
        return res.json(jwtAuth.encodeToken(newUser));
      });
    });

  });

  app.get('/api/auth/facebook', passport.authenticate('facebook', { session: false }));
  app.get('/api/auth/facebook/callback', passport.authenticate('facebook', { session: false }), function(req, res) {
    // db.Users.findOrCreate({facebookId: profile.id}, function(err, user) {
    //   //TODO
    //   user.profile.avatarUrl = profile.photos;
    //   user.profile.name = profile.name;
    //   user.profile.email = profile.email;
    //   user.username = profile.email;
    //   user.save();
    //   res.json(jwtAuth.encodeToken(user));
    // });
  });

  /**
   * Event routes
   */
  app.post('/api/event', jwtAuth.checkToken, function(req, res) {
    console.log(req.body);
    var event = new db.Events({
      eventTitle: req.body.eventTitle,
      eventIsLive: false,
      createdBy: req.user.username,
      adminUsers: [req.user.username, 'CPelkey', 'maddog', 'rg'],
      time: Date.now().valueOf()
    });

    event.save(function(err, event) {
      if (err) console.log(err);
      else {
        res.json(event);
      }
    });
  });

  app.get('/api/event', function(req, res) {
    db.Events.find(function(err, events) {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      var sorted = R.sortBy(R.prop('time'), events);
      res.json(sorted);
    });
  });

  app.get('/api/event/:eventId', function(req, res) {
    db.Events.findById(req.params.eventId, function(err, event) {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      res.json(event);
    });
  });

  app.put('/api/event/:eventId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    db.Events.findById(req.params.eventId, function(err, event) {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      event.eventTitle = req.body.eventTitle;
      event.eventIsLive = req.body.eventIsLive;
      event.adminUsers = req.body.adminUsers;
      // TODO validate users against db

      event.save(function(err, event) {
        if (err) return res.sendStatus(500);
        socket.send('put', 'Event', req.params.eventId, {
          eventId: req.params.eventId,
          event: event
        });
        return res.json(event);
      });
    });
  });

  app.delete('/api/event/:eventId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    db.Events.remove({_id: req.params.eventId}, function(err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        console.log('deleted and removed', req.params);
        res.sendStatus(200);
      }
    });
  });

  /**
   * Entry routes
   */

  app.post('/api/event/:eventId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    var entry = new db.Posts(req.body);
    entry.time = Date.now().valueOf();
    entry.timeEU = utils.getTimeEU();
    entry.save(function(err) {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        socket.send('post', 'Entry', req.params.eventId, {
          eventId: req.params.eventId,
          entry: entry
        });
        res.json(entry);
      }
    });
  });

  app.get('/api/event/:eventId/entry', function(req, res) {
   db.Posts.find({eventId: req.params.eventId}, function(err, entries) {
     if (err) {
       console.log(err);
       res.sendStatus(400);
     } else if (entries) {
       res.json(entries);
     } else {
       res.json({});
     }
   });
  });

  app.delete('/api/event/:eventId/entry/:entryId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    db.Posts.remove({_id: req.params.entryId}, function(err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        socket.send('delete', 'Entry', req.params.eventId, req.params);
        console.log('delete', 'Entry', req.params);
        res.sendStatus(200);
      }
    });
  });

  app.put('/api/event/:eventId/entry/:entryId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    db.Posts.findById(req.params.entryId, function(err, entry) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        console.log('rq body', req.body)
        entry.postText = req.body.postText;
        entry.replies = req.body.replies;
        entry.save(function(err, newEntry) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            socket.send('put', 'Entry', req.params.eventId, {
              entryId: req.params.entryId,
              eventId: req.params.eventId,
              entry: entry
            });
            res.json(newEntry);
          }
        });
      }
    });
  });

  /**
   * Comment routes
   */

  app.post('/api/event/:eventId/comment', jwtAuth.checkToken, function(req, res) {
    var comment = new db.Comments(req.body);
    comment.time = Date.now().valueOf();
    comment.timeEU = utils.getTimeEU();
    comment.save(function(err) {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        socket.send('post', 'Comment', req.params.eventId, {
          eventId: req.params.eventId,
          comment: comment
        });
        res.json(comment);
      }
    });
  });

  app.get('/api/event/:eventId/comment', jwtAuth.checkToken, localAuth.checkAdmin,  function(req, res) {
   db.Comments.find({eventId: req.params.eventId}, function(err, comments) {
     if (err) {
       console.log(err);
       res.sendStatus(400);
     }
     var sortedComments = R.sortBy(R.prop('time'), comments);
     res.json(sortedComments);
   });
  });

  app.delete('/api/event/:eventId/comment/:commentId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    db.Comments.remove({_id: req.params.commentId}, function(err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        socket.send('delete', 'Comment', req.params.eventId, req.params);
        console.log('delete', 'Comment', req.params);
        res.sendStatus(200);
      }
    });
  });

  app.put('/api/event/:eventId/entry/:commentId', jwtAuth.checkToken, localAuth.checkAdmin, function(req, res) {
    //TODO
  });

  /**
   * S3 Image Upload
   */

  app.post('/api/sign', jwtAuth.checkToken, S3Sign.sign);

  /**
   * Force all connected clients to reload
   */
  app.post('/api/reload/:eventId', jwtAuth.checkToken, function(req, res) {
    socket.send('reload', 'System', req.params.eventId);
    res.sendStatus(200);
  });
});

app.listen(80);
