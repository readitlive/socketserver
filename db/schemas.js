var mongoose = require('mongoose');

exports.eventsSchema = new mongoose.Schema({
  eventTitle: String,
  adminUsers: [ String ],
  eventIsLive: Boolean,
  time: Date
});

exports.postsSchema = new mongoose.Schema({
  postText: String,
  author: String,
  eventId: String,
  time: Date,
  postIsComment: Boolean,
  avatarUrl: String,
  timeEU: String
});

exports.commentsSchema = new mongoose.Schema({
  commentText: String,
  author: String,
  eventId: String,
  time: Date
});

exports.usersSchema = new mongoose.Schema({
  username: String,
  services: {
    password: {bcrypt: String}
  },
  profile: {name: String},
  avatarUrl: String
});

// Events = new Meteor.Collection('events');
//   // eventTitle: eventTitle,
//   // adminUsers: [ user.username, ]
//   // eventIsLive: false,
//   // time: Date.now()
//
//
//
// Posts = new Meteor.Collection('posts');
//
//   // postText: postText,
//   // author: user.username,
//   // eventId: this._id,
//   // time: Date.now()
//   // postIsComment: BOOL
//   // avatarUrl: url
//   // timeEU: timeEUString
//
//
//
// Comments = new Meteor.Collection('comments');
//
//   // commentText: commentText,
//   // author: "commentator"
//   // eventId: this._id,
//   // time: Date.now()
//
//
// //Users
//   // avatarUrl: s3
//
// Presences = new Meteor.Collection('presences');
// // For backwards compatibilty
// Meteor.presences = Presences;
