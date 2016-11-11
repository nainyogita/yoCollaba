'use strict';

import mongoose from 'mongoose';

var WallSchema = new mongoose.Schema({
  name: String,
  domain: String,
  posts: [{
    title: String,
    image: String,
    description: String,
    author: String
  }]
});

export default mongoose.model('Wall', WallSchema);
