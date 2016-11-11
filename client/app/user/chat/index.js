'use strict';

import angular from 'angular';
import ChatController from './chat.controller';

export default angular.module('gabfestApp.chat', [])
  .controller('ChatController', ChatController)
  .name;
