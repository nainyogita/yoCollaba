/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/emojiss              ->  index
 * POST    /api/emojiss              ->  create
 * GET     /api/emojiss/:id          ->  show
 * PUT     /api/emojiss/:id          ->  upsert
 * PATCH   /api/emojiss/:id          ->  patch
 * DELETE  /api/emojiss/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Emojis from 'node-emoji';

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

// Gets a list of Emojiss
export function index(req, res) {
  return res.json(Emojis.emoji);
}
