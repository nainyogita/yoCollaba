'use strict';

var express = require('express');
var controller = require('./team.controller');
import * as auth from '../../auth/auth.service';
var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
router.get('/:id',auth.isAuthenticated(), controller.show);
router.get('/:email/getTeams',auth.isAuthenticated(), controller.getTeams);
router.get('/:email/getUserTeams',auth.isAuthenticated(), controller.getUserTeams);
router.post('/',auth.hasRole('thead'), controller.create);
router.post('/teamEdit',auth.hasRole('thead'),controller.teamEdit);//
router.put('/:id',auth.isAuthenticated(), controller.upsert);
router.put('/:email/leaveGroup',auth.isAuthenticated(), controller.leaveGroup);//
router.put('/:email/addTeamMember',auth.hasRole('thead'), controller.addTeamMember);//
router.patch('/:id',auth.isAuthenticated(), controller.patch);
router.delete('/:id',auth.isAuthenticated(), controller.destroy);

module.exports = router;
