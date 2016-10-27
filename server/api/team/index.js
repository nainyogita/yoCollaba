'use strict';

var express = require('express');
var controller = require('./team.controller');
import * as auth from '../../auth/auth.service';
var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
router.get('/:id',auth.isAuthenticated(), controller.show);
router.get('/:email/getTeams',auth.isAuthenticated(), controller.getTeams);
router.get('/:email/getUserTeams',auth.isAuthenticated(), controller.getUserTeams);
router.post('/', controller.create);
router.post('/teamEdit',controller.teamEdit);
router.put('/:id',auth.isAuthenticated(), controller.upsert);
router.put('/:email/addTeamMember',auth.isAuthenticated(), controller.addTeamMember);
router.patch('/:id',auth.isAuthenticated(), controller.patch);
router.delete('/:id',auth.isAuthenticated(), controller.destroy);

module.exports = router;
