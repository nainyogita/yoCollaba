/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/teams              ->  index
 * POST    /api/teams              ->  create
 * GET     /api/teams/:id          ->  show
 * PUT     /api/teams/:id          ->  upsert
 * PATCH   /api/teams/:id          ->  patch
 * DELETE  /api/teams/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Team from './team.model';
import User from '../user/user.model';
import Channel from '../channel/channel.model';
var emailFunction = require('../user/email.js');

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


/**
 * Function to leave from a channel group
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @return {function}  promise
 */
export function leaveGroup(req,res){

  var leaveChannel = req.body.leave.channel;
  var userEmail = req.params.email;

  return Channel.findById(leaveChannel._id).exec()
    .then(channelObj =>{

      if(!channelObj){
        return res.status(401).end();
      }

      var members = channelObj.members; // lists all members of the channel
      var find = members.indexOf(userEmail); // find index of current user to be removed
      if(find!=-1)
      {
        members.splice(find,1); // remove current user
      }

      channelObj.members = members; //update the member array of channel schema
      channelObj.save()
                .then(() => {
                  respondWithResult(res);
                });

      // Remove the channel from current user schema entry
      User.findOne({'email':userEmail}).exec()
      .then(userObj =>{
        var userChannel = userObj.channel;

        var find = userChannel.indexOf(leaveChannel._id);
        if(find != -1){
          userChannel.splice(find,1);
        }

       userObj.channel = userChannel;
        userObj.save()
        .then(() => {
          respondWithResult(res);
        });

      })
      .catch(handleError(res));
    })
    .catch(handleError(res));
}


/**
 * function for editing team information
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @return {function}  promise
 */
export function teamEdit(req,res){
  var team = req.body.JSON;
  return Team.findById(team.id).exec()
    .then(teamObj =>{

      if(!teamObj){
        return res.status(401).end();
      }
      teamObj.name = team.name;
      teamObj.info = team.info;
      teamObj.save()
             .then(() => {
               respondWithResult(res);
             });
    })
    .catch(handleError(res));
  }


/**
 * Gets a list of teams the team leader is a part of
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @return {function}  promise
 */
export function getTeams(req,res){
  var email = req.params.email;
  return Team.find({'thead' : email})
    .populate('channel')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/**
 * Gets a list of Teams
 * @param  {Object} req request object
 * @param  {Object} res response
 * @return {function}  promise
 */
export function getUserTeams(req,res){
  var email = req.params.email;
  return Team.find({'members' : email})
    .populate('channel')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a Team
export function index(req, res) {
  return Team.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/**
 * Gets a single Teams
 * @param  {Object} req request object
 * @param  {Object} res response
 * @return {function}  promise
 */
export function show(req, res) {
  return Team.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


/**
 * Creates a new Team in the DB
 * @param  {Object} req request object
 * @param  {Object} res response
 * @return {function}  promise
 */
export function create(req, res) {
  return Team.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}


/*
 * Upserts the given Team in the DB at the specified ID
 * @param  {Object} req request object
 * @param  {Object} res response
 * @return {function}  promise
 */
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Team.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()

  .then(respondWithResult(res))
    .catch(handleError(res));
}

/**
 * Updates an existing Team in the DB
 * @param  {Object} req request object
 * @param  {Object} res response
 * @return {function}  promise
 */
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Team.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


/**
 * Deletes a Team from the DB
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @return {function}  promise
 */
export function destroy(req, res) {
  return Team.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


/**
 * Function to add a new team member
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @return {function}  promise
 */
export function addTeamMember(req, res) {

  var userEmail = req.params.email;
  var teamName = String(req.body.team.teamName);
  var member = String(req.body.team.member);

  return Team.findOne({'name':teamName})
  .populate("channel")
  .exec()
    .then(teamObj => {
      if(!teamObj) {
        return res.status(401).end();
      }

      var find = teamObj.members.indexOf(member);

      if(find!=-1){
        return res.status(204).end();
      }

      teamObj.members.push(member);

      // PostData for sending emails
            var postData = {
                email: member,
                message: 'This email is to notify you that you are '+
                 'a part of team " '+teamObj.name +' "',
                password:''
              };

      //registering a memeber with a team
      User.findOne({'email':member}).exec()
      .then(userObj => {

        if(!userObj) {
          // return res.status(401).end();
          userObj = new User({
            'email' : member,
            'password' : 'password',
            'provider' : 'local'
          });
          postData.password = 'password';
        }
        else{
          postData.password = 'your existing passoword credentials';
        }

        userObj.team.push(teamObj);
        userObj.save();
        emailFunction(postData);

        //Add this user to the public channel of the teamObj
        var channelArr = teamObj.channel;
        var channelObj = null;
        for( var idx = 0; idx < channelArr.length; idx++ ) {
          var channelObj = channelArr[idx];
          if(channelObj.name === 'public'){
            // Just break out of the loop
            break;
          }
        }
        /**
        *Out of the channel retrieved, add the person to the public channel
        */
        Channel.findOne(channelObj).exec()
               .then( trueChannelObj => {
                 trueChannelObj.members.push(member);

            // Now save this public channel agains the user that has been added
                 userObj.channel.push(trueChannelObj);
                 trueChannelObj.save();
                 userObj.save();
          });
      });

      //saving memeber in a particular team
      teamObj.save()
      .then(()=>{
        res.sendStatus(200);
      });

    });

}
