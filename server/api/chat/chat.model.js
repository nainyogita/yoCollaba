'use strict';

import mongoose from 'mongoose';

var ChatSchema = new mongoose.Schema({
  type:String,
  channel: String,
  participants:[String], //empty for group chats
  info: String,
  history: [{sender: String, message: String, timestamp: {type: Date, default: Date.now}}]
});

export default mongoose.model('Chat', ChatSchema);
