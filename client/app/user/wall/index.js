'use strict';

import angular from 'angular';
import WallController from './wall.controller';

export default angular.module('yoCollabaApp.wall', [])
  .controller('WallController', WallController)
  .name;
