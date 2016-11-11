'use strict';
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import Channel from '../channel/channel.model';

var TeamSchema = new mongoose.Schema({
  name: String,
  thead: [String],//multiple heads of team
  members: [String],
  info: String,
  channel: [{
    type: Schema.Types.ObjectId,
    ref : 'Channel'
  }]
});

export default mongoose.model('Team', TeamSchema);
