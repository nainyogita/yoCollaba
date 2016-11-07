/**
* Using Rails-like standard naming convention for endpoints.
* GET     /api/channels              ->  index
* POST    /api/channels              ->  create
* GET     /api/channels/:id          ->  show
* PUT     /api/channels/:id          ->  upsert
* PATCH   /api/channels/:id          ->  patch
* DELETE  /api/channels/:id          ->  destroy
*/

'use strict';

import jsonpatch from 'fast-json-patch';
import Channel from './channel.model';
import Team from '../team/team.model';
import User from '../user/user.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
      .then(() => {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {

    res.status(statusCode).send(err);
  };
}

// Gets a list of Channels
export function index(req, res) {
  return Channel.find().exec()
  .then(respondWithResult(res))
  .catch(handleError(res));
}

// Gets a single Channel from the DB
export function show(req, res) {
  return Channel.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(handleError(res));
}

/**
 * Update the channel values
 * @param  {Object} req The request object
 * @param  {Object} res The response object
 * @return {Function}     Promise function
 */
export function updateChannel(req, res) {
  return Team.findOne({'name' : req.body.name}).populate('channel').exec()
         .then((team) => {
          //  Find the given channel first in the array
          for( var idx = 0; idx < team.channel.length; idx++ ){
            if(team.channel[idx].name === req.body.blob.name) {
              // Save it in the channel document first
              Channel.findOne({'name' : req.body.blob.name})
                     .exec().then((channel) => {
                       channel.name = req.body.blob.name;
                       channel.info = req.body.blob.info;
                       channel.members = req.body.blob.members;
                       channel.save().then(function() {
                         team.channel[idx] = channel;
                         team.save();
                       });
                     })
                     .catch(handleError(res));
              break;
            }
          }
        })
        .catch(handleError(res));
}

/**
 * Create a new channel in the team specified in the req body
 * @param  {Object} req The request object
 * @param  {Object} res The response object
 * @return {Function}     Promise function
 */
export function create(req, res) {
  return Team.findById(req.body.teamId).populate('channel').exec()
  .then((team) => {
    if(!team) {
      return res.status(401).end();
    }

    var members = req.body.JSON.members; // Get the members added in this channel
    var theads = team.thead; // Get the team leaders of this team
    // Add these team leads as channel members in newly created channel
    for(var i=0; i<theads.length ; i++)
      req.body.JSON.members.push(theads[i]);
      // Save the newly created channel
    var channelObj = new Channel(req.body.JSON);
    team.channel.push(channelObj);
    // Save the channel information
    channelObj.save().then(function() {
      // Save the team information
      team.save().then(function() {
        // Save channel against the users
        var members = req.body.JSON.members;
        for(let i = 0; i < members.length; i++){
            User.findOne({'email':members[i]}).exec()
            .then(userObj =>{
              if(!userObj) {
                userObj = new User({
                  'email' : members[i],
                  'password' : 'password',
                  'provider' : 'local'
                });
              }
              userObj.channel.push(channelObj);
              userObj.save()
              .catch(handleError(res));
          });
        }
      //
    })
    .catch(handleError(res));
  })
  .catch(handleError(res));
  })
  .catch(handleError(res));
}
