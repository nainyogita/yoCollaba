'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);

  User.findOne({
      'email': newUser.email
    })
    .exec()
    .then(userObj => {
      if (!userObj) {
        newUser.provider = 'local';
        newUser.status = true;
        newUser.save()
          .then(function(user) {
            var token = jwt.sign({
              _id: user._id
            }, config.secrets.session, {
              expiresIn: 60 * 60 * 5
            });
            res.json({
              token
            });
          })
          .catch(validationError(res));
      }   else{

      userObj.status = true;
      userObj.password = newUser.password;
      userObj.name = newUser.name;
      userObj.save()
      .then(function(user) {
        var token = jwt.sign({ _id: user._id }, config.secrets.session, {
          expiresIn: 60 * 60 * 5
        });
        res.json({ token });
      })
      .catch(validationError(res));
    }
    });
}

/**
 *creates new organization
 */
export function newOrg(req, res) {
  var newUser = new User(req.body);

  (newUser.organization).push(req.params.id);

  newUser.save()
    .then(function(user) {
      var token = jwt.sign({
        _id: user._id
      }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({
        token
      });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId)
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
 export function changePassword(req, res) {
   var userId = req.user._id;
   var username = String(req.body.username);
   var oldPass = String(req.body.oldPassword);
   var newPass = String(req.body.newPassword);

   return User.findById(userId).exec()
   .then(user => {
     if(user.authenticate(oldPass)) {
       user.password = newPass;
       user.name = username;
       return user.save()
       .then(() => {
         res.status(204).end();
       })
       .catch(validationError(res));
     } else {
       return res.status(403).end();
     }
   });
 }
 
/**
 * Get user details from user email
 */
export function getByEmail(req, res, next) {
  var userEmail = req.params.email;
  console.log("--------Inside get By Email--------");
  console.log(userEmail);
  return User.findOne({
      'email': userEmail
    }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({
      _id: userId
    }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
