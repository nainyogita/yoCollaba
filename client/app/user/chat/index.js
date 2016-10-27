'use strict';

import angular from 'angular';
import ChatController from './chat.controller';

export default angular.module('yoCollabaApp.chat', [])
  .controller('ChatController', ChatController)
  .name;
