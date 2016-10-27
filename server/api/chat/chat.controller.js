/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/chats              ->  index
 * POST    /api/chats              ->  create
 * GET     /api/chats/:id          ->  show
 * PUT     /api/chats/:id          ->  upsert
 * PATCH   /api/chats/:id          ->  patch
 * DELETE  /api/chats/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Chat from './chat.model';
import path from 'path';
import fs from 'fs';

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

// Gets a list of Chats
export function index(req, res) {
  return Chat.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Chat from the DB
export function show(req, res) {
  return Chat.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Chat in the DB
export function create(req, res) {
  return Chat.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Chat in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Chat.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Chat in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Chat.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Chat from the DB
export function destroy(req, res) {
  return Chat.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function uploadFile(req, res){
    // We are able to access req.files.file
    // throught the multiparty middleware

    var file = req.files.file;
    //var filename = path.basename(data.name);
    var filepath = path.join(__dirname, '.', 'uploads', file.name);
    fs.createWriteStream(filepath);
    
    
}
