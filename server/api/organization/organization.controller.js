/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/organizations              ->  index
 * POST    /api/organizations              ->  create
 * GET     /api/organizations/:id          ->  show
 * PUT     /api/organizations/:id          ->  upsert
 * PATCH   /api/organizations/:id          ->  patch
 * DELETE  /api/organizations/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Organization from './organization.model';
import Team from '../team/team.model';
import User from '../user/user.model';
import Channel from '../channel/channel.model';

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

// Retrieve data abt the logged in owner
export function owner(req, res) {
  //Retrieve the email - id from the query of the request
  var email = req.params.email;
  return Organization.findOne({'owner.email' : email})
    .populate('team')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of Organizations
export function index(req, res) {
  return Organization.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Organization from the DB
export function show(req, res) {
  return Organization.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Create a new team
export function createTeam(req, res) {
  var userEmail = req.params.email;
  return Organization.findOne({'owner.email':userEmail}).exec()
    .then(org => {
      if(!org)
      {
        return res.status(401).end();
      }

      var teamObj = new Team(req.body.orgTeam.teams);
      /** adding team leader as a member of team created
      *   by owner of organization
      */

      var teamHeads = teamObj.thead;
      for(var i = 0 ; i<teamHeads.length ; i++){
        teamObj.members.push(teamObj.thead[i]);
      }

      var publicChannel = new Channel({
            name : 'public',
            info : 'A default channel which is public',
            members : teamHeads,
            type : 'public'
      });

      teamObj.channel.push(publicChannel);
      publicChannel.save();
      //save team in Organization schema
      org.team.push(teamObj);

      // save team in user table for owner
      for(var i = 0 ; i<teamObj.thead.length ; i++){
        var email = teamObj.thead[i].trim();
        User.findOne({
            'email' : email
          })
          .exec()
          .then(user => {
            // if not a registered user then add to the database
            // with credentials - email
            if(!user){
              user = new User({
                'email' : email,
                'password' : 'password',
                'provider' : 'local'
              });
            }
            user.team.push(teamObj);
            user.channel.push(publicChannel);
            user.organization.push(org);
            user.role = "thead";
            user.save();
          });
      }

      //save team in teams table
      teamObj.save();


      //save team in Organization schema
        return org.save()
          .then(() => {
            res.status(204).end();
          });
    });
}

/**
* Delete a team
*/
export function deleteTeam(req, res) {
  var userEmail = req.params.email;
  var teamName = String(req.body.orgTeam.teamName);
  Team.findOne({'name':teamName}).exec()
  .then(teamObj => {
    return Organization.findOne({'owner.email':userEmail}).exec()
      .then(org => {
        //list of all the channels that were part of the deleted team
        var teamChannels = teamObj.channel;
        //delete the channels of the deleted team
        for(var i=0 ; i<teamChannels.length ; i++){
          Channel.findOne(teamChannels[i]).exec()
          .then(handleEntityNotFound(res))
          .then(removeEntity(res))
          .catch(handleError(res));
        }
        //delete team from team schema
        Team.findOne(teamObj).exec()
          .then(handleEntityNotFound(res))
          .then(removeEntity(res))
          .catch(handleError(res));

          for(var i=0  ; i<teamObj.thead.length ; i++){
          //delete team from user table
            User.findOne({'email':teamObj.thead[i]}).exec()
              .then(user => {
                user.team.splice(user.team.indexOf(teamObj._id),1);
                user.save();
              }).catch(handleError(res));
          }
        //delete team from organization schema
        org.team.splice(org.team.indexOf(teamObj._id), 1);
          return org.save()
            .then(() => {
              res.status(204).end();
            })
            .catch(handleError(res));
      });
  });
}



// Creates a new Organization in the DB
export function create(req, res) {
 return Organization.findOne({owner : req.body.owner}).exec()
   .then((data) => {
     if(data != null){
       // Exists, so send error it
       res.send("EXISTS");
     }
     else{
       Organization.create(req.body);
       res.send("NO");
     }
   })
   .catch(handleError(res));
}

// Upserts the given Organization in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Organization.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Organization in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Organization.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Organization from the DB
export function destroy(req, res) {
  return Organization.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
