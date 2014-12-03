var mongoose = require('mongoose');

var thoughtSchema = new mongoose.Schema({
  title: String,
  modifiedOn: { type: Date, default: Date.now },
  createdOn: { type: Date, default: Date.now },
  thought: String,
  postedBy: { type: String, ref: 'User' }
});

module.exports = mongoose.model( 'Thought', thoughtSchema );