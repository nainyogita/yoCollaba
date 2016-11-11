'use strict';

import mongoose from 'mongoose';

var ChatSchema = new mongoose.Schema({
  roomName: String,
  history: [{
    sender: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

export default mongoose.model('Chat', ChatSchema);
