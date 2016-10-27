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

// Creates a new Channel in the DB
export function create(req, res) {
  return Team.findById(req.body.teamId).exec()
  .then((team) => {
    if(!team) {
      return res.status(401).end();
    }

    var members = req.body.JSON.members;

    members.push(req.body.teamLeader);
    req.body.JSON.members = members;

    var channelObj = new Channel(req.body.JSON);
    team.channel.push(channelObj);
    //save the channel

    channelObj.save();



    //save channel for the team

    team.save();



    //save channel for channel members
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
        userObj.save();


      })
      .catch(handleError(res));

    }

  })
  .catch(handleError(res));
}

// Upserts the given Channel in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Channel.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

  .then(respondWithResult(res))
  .catch(handleError(res));
}

// Updates an existing Channel in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Channel.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(patchUpdates(req.body))
  .then(respondWithResult(res))
  .catch(handleError(res));
}

// Deletes a Channel from the DB
export function destroy(req, res) {
  return Channel.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(removeEntity(res))
  .catch(handleError(res));
}
