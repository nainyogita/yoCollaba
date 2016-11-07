'use strict';

var express = require('express');
var controller = require('./emojis.controller');
import * as auth from '../../auth/auth.service';
var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
// router.get('/:id', controller.show);
// router.post('/', controller.create);
// router.put('/:id', controller.upsert);
// router.patch('/:id', controller.patch);
// router.delete('/:id', controller.destroy);

module.exports = router;
