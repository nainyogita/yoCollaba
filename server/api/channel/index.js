'use strict';

var express = require('express');
var controller = require('./channel.controller');
import * as auth from '../../auth/auth.service';
var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/addChannel', controller.create);
router.put('/updateChannel', controller.updateChannel);

module.exports = router;
