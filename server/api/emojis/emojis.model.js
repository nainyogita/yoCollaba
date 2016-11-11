'use strict';

import mongoose from 'mongoose';

var EmojisSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Emojis', EmojisSchema);
