'use strict';

var express = require('express');
var controller = require('./channel.controller');
import * as auth from '../../auth/auth.service';
var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
router.get('/:id',auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/addChannel', controller.create);
router.put('/:id',auth.isAuthenticated(), controller.upsert);
router.patch('/:id',auth.isAuthenticated(), controller.patch);
router.delete('/:id',auth.isAuthenticated(), controller.destroy);

module.exports = router;
