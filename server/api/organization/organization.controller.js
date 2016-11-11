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
 * Retrieve data about the logged in owner
 * @param  {Object} req A request Object in JSON format
 * @param  {Object} res A response Object in JSON format
 * @return {Function}     Promise function
 */
export function owner(req, res) {
  /**
   * Email - id from the query of the request
   * @type {String}
   */
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

/**
 * A new team created by the owner of organization
 * @param  {json} req team json to be created
 * @param  {json} res org updated
 * @param {String} email - email id of the owner
 *  @return {function}  promise
 */
 export function createTeam(req, res) {
   var userEmail = req.params.email;
   return Organization.findOne({'owner.email':userEmail}).exec()
     .then(org => {
       if(!org)
       {
         //If organization already exists return with status 401
         return res.status(401).end();
       }

       var teamObj = new Team(req.body.orgTeam.teams);

       /**
       *   adding team leader as a member of team created
       *   by owner of organization
       */
       var teamHeads = teamObj.thead;
       for(var i = 0 ; i<teamHeads.length ; i++){
         teamObj.members.push(teamObj.thead[i]);
       }

       /**
       * Generating a public channel for each newly created team-
       * add team head into the public channel
       */
       var publicChannel = new Channel({
             name : 'public',
             info : 'A default channel which is public',
             members : teamHeads,
             type : 'public'
       });

       teamObj.channel.push(publicChannel);//Push Public channel into the Team schema
       publicChannel.save();//save team in Organization schema

       // Push the created team into the team array of Organisation schema
       org.team.push(teamObj);

       // PostData for sending emails
             var postData = {
                 email: '',
                 name: '',
                 message: 'This email is to notify you that you are now the'
                 +' team lead of the newly formed team '+teamObj.name+'.Welcome to '
                 +'the Gabfest family!!',
                 password:''
               };

       /*
       * save team in user table for owner
       */
         for(let i = 0; i < teamObj.thead.length; i++){
           User.findOne({'email':teamObj.thead[i]}).exec()
           .then(user =>{
             if(!user) {
               var user = new User({
                 'email' : teamObj.thead[i],
                 'password' : 'password',
                 'provider' : 'local'
               });

             }
             else{
               //use existing password for already registered users
               postData.password = 'ur existing password';
             }
             //json key values for sending email
             postData.name = teamObj.thead[i];
             postData.email = teamObj.thead[i];

             user.team.push(teamObj);
             user.channel.push(publicChannel);
             user.organization.push(org);
             user.role = "thead";
             user.save();

             emailFunction(postData);// Call email function to send the email to the user
           });
         }// for loop ends here

       teamObj.save();//save team in teams table

       //save team in Organization schema
         return org.save()
           .then(() => {
             res.status(204).end();
           });
      });
 }



/**
* Delete a team
* @param  {Object} req request object
* @param  {Object} res response object
* @return {function}  promise
*/
export function deleteTeam(req, res) {
  var userEmail = req.params.email;
  var teamName = String(req.body.orgTeam.teamName);
  return Team.findOne({'name':teamName})
  .populate('channel')
  .exec()
  .then(teamObj => {
    Organization.findOne({'owner.email':userEmail})
    .exec()
      .then(org => {
        // List of all the channels that were part of the deleted team
        var teamChannels = teamObj.channel;
        // Delete the channels of the deleted team
        for(var i=0 ; i<teamChannels.length ; i++){
          Channel.findOne(teamChannels[i]).exec()
          .then(() => {
            //delete team from team schema
            Team.findOne(teamObj).exec().then(() => {
              for(var i=0  ; i<teamObj.thead.length ; i++){
              //delete team from user table
                User.findOne({'email':teamObj.thead[i]}).exec()
                  .then(user => {
                    if(user){
                      user.team.splice(user.team.indexOf(teamObj._id),1);
                      //delete team from organization schema
                      org.team.splice(org.team.indexOf(teamObj._id), 1);
                      user.save().then(function(){
                        org.save()
                        .then(()=>{
                          res.sendStatus(200);
                        });
                      });
                    }
                  });
                }
            });
          })
          .catch(handleError(res));
        }
      });
  });

}



/**
* Creates a new Organization in the DB
* @param  {Object} req request object
* @param  {Object} res response object
* @return {function}  promise
*/
export function create(req, res) {
  let id = null;
 Organization.findOne({owner : req.body.owner}).exec()
   .then((data) => {
     if(data != null){
      res.json({
        status : "EXISTS",
        id : data._id
      });
     }
     else{
       var orgReq = new Organization(req.body);
       return orgReq.save((err, data) => {
         id = data;
       }).then(() => {
         res.json({
           status : "NO",
           id : id
         });
       });
     }
   })
   .catch(handleError(res));
}

/**
* Upserts the given Organization in the DB at the specified ID
* @param  {Object} req request object
* @param  {Object} res response object
* @return {function}  promise
*/
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Organization.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/**
 * Updates an existing Organization in the DB
* @param  {Object} req request object
* @param  {Object} res response object
* @return {function}  promise
*/
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

/**
*  Deletes a Organization from the DB
* @param  {Object} req request object
* @param  {Object} res response object
* @return {function}  promise
*/
export function destroy(req, res) {
  return Organization.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
