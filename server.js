var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var R = require('ramda');

var socket = require('./socketserver');

var db = require('./db/setup');

db.once('open', function() {

  app.use(bodyParser.json());

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
    next();
  });

  app.use(express.static(__dirname + '/public'));

  // app.get('/:filename', function(req, res, next) {
  //   var filename = req.params.filename;
  //   if (!filename) filename = 'index.html';
  //
  //   var options = {
  //     root: __dirname + '/public/',
  //     dotfiles: 'deny',
  //     headers: {
  //       'x-timestamp': Date.now(),
  //       'x-sent': true
  //     }
  //   };
  //
  //   res.sendFile(filename, options, function(err) {
  //     if (err) {
  //       console.log(err);
  //       res.status(err.status).end();
  //     }
  //   });
  //
  // });

  app.get('/api/users', function(req, res) {
    db.Users.findOne({username: 'CPelkey'}, function(err, user) {
      console.log(user);
    });
    res.send('hi');
  });


  /**
   * Event routes
   */
  app.post('/api/event', function(req, res) {
    console.log(req.body)
    var event = new db.Events({
      eventTitle: req.body.eventTitle,
      eventIsLive: false,
      time: Date.now()
    });

    event.save(function(err, event) {
      if (err) console.log(err);
      else {

        res.send(event);
      }
    });
  });

  app.get('/api/event', function(req, res) {
    db.Events.find(function(err, events) {
      if (err) {
        console.log(err);
        res.status(400).end();
      }
      var sorted = R.sortBy(R.prop('time'), events);
      res.send(sorted);
    });

  });

  app.get('/api/event/:eventId', function(req, res) {
    db.Events.findById(req.params.eventId, function(err, event) {
      if (err) {
        console.log(err);
        res.status(400).end();
      }
      res.send(event);
    });

  });

  //TODO
  app.put('/api/event/:eventId', function(req, res) {
    db.Events.findById(req.params.eventId, function(err, event) {
      if (err) {
        console.log(err);
        res.status(400).end();
      }
    });
  });

  app.delete('/api/event/:eventId', function(req, res) {
    console.log('deleting', req.params);
    db.Events.findById(req.params.eventId, function(err) {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        console.log('deleted ', req.params)

        res.status(200).end();
      }
    })
  });

  /**
   * Entry routes
   */

  //TODO
  app.post('/api/event/:eventId', function(req, res) {
    console.log('req body: ', req.body);
    var entry = new db.Posts(req.body);

    entry.save(function(err) {
      if (err) {
        console.log(err);
        res.status(400).end();
      } else {
        socket.send('post', 'Entry', req.params.eventId, {
          eventId: req.params.eventId,
          entry: entry
        });
        res.send(entry);
      }
    });
  });

  app.get('/api/event/:eventId/entry', function(req, res) {
   db.Posts.find({eventId: req.params.eventId}, function(err, posts) {
     if (err) {
       console.log(err);
       res.status(400).end();
     }
     var sortedPosts = R.sortBy(R.prop('time'), posts);
     res.send(sortedPosts);

   });
  });

  app.delete('/api/event/:eventId/entry/:entryId', function(req, res) {
    db.Posts.remove({_id: req.params.entryId}, function(err) {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        socket.send('delete', 'Entry', req.params.eventId, req.params)
        console.log('delete', 'Entry', req.params)
        res.status(200).end();
      }
    })
  });

  //PUT
  //socket.send...

});

// login

// logout

// create account



app.listen(3000);
