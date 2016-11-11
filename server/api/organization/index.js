'use strict';

var express = require('express');
var controller = require('./organization.controller');
import * as auth from '../../auth/auth.service';
var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
router.get('/:id',auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.put('/:email/createTeam',auth.hasRole('owner'), controller.createTeam);
router.put('/:email/deleteTeam',auth.hasRole('owner'),controller.deleteTeam);
router.get('/:email/getTeam',auth.isAuthenticated(), controller.owner);
router.put('/:id',auth.isAuthenticated(), controller.upsert);
router.patch('/:id',auth.isAuthenticated(), controller.patch);
router.delete('/:id',auth.isAuthenticated(), controller.destroy);

module.exports = router;
