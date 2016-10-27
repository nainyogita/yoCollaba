'use strict';

import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import Team from '../team/team.model';

//Model for Organization
var OrganizationSchema = new mongoose.Schema({
  name: String, //Name of organisation
  domain: String, //@abc.com
  approvalStatus: Boolean, // approvalStatus=false when new Organization is created
 //Details about owner of organisation
  owner: {
    name: String,
    email: String
  },
  info: String,
  //Each org contains no of teams
  team: [{
    type: Schema.Types.ObjectId,
    ref : 'Team'
  }],

});

export default mongoose.model('Organization', OrganizationSchema);
