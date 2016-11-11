'use strict';

import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var ChannelSchema = new mongoose.Schema({
  name: String,
  info : String,
  members : [ String ],
  type : String
//  type: String //Public or Private
});

export default mongoose.model('Channel', ChannelSchema);
