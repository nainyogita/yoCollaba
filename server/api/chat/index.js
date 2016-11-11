'use strict';

var express = require('express');
var controller = require('./chat.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:roomName', controller.getChatHistory);
router.post('/:roomName', controller.saveMessage);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:roomName', controller.unreadMsg);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
