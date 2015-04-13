var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var R = require('ramda');

var db = require('./db/setup');

db.once('open', function() {

  app.use(bodyParser.json());

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
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

  //TODO
  app.delete('/api/event/:eventId', function(req, res) {

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
        res.send(entry);
      }
    });
  });

  //TODO: First check if any entries are attached to the event itself
  app.get('/api/event/:eventId/entry', function(req, res) {
   db.Posts.find({eventId: req.params.eventId}, function(err, posts) {
     if (err) {
       console.log(err);
       res.status(400).end();
     }
     var sorted = R.sortBy(R.prop('time'), posts);
     res.send(sorted);

   });
  });

  //TODO:
  app.delete('/api/entry/:eventId/entry/:entryId', function(req, res) {

  });
});


//routes:
// files

// create entry
// get event
// update event
// delete event

// post entry
// put entry
// delete entry

// post comment
// put comment
// delete comment

// login

// logout

// create account



app.listen(3000);


var dummyPostData = [
  {
    metaData: {author: 'Forest', timeEU: 'ten minutes ago'},
    text: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then'
  },
  {
    metaData: {author: 'Greg', timeEU: 'ten minutes ago'},
    text: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then'
  },
  {
    metaData: {author: 'Forest', timeEU: 'ten minutes ago'},
    text: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then'
  },
  {
    metaData: {author: 'Steve', timeEU: 'ten minutes ago'},
    text: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then'
  }
];
