'use strict';

import angular from 'angular';
import WallController from './wall.controller';

export default angular.module('gabfestApp.wall', [])
  .controller('WallController', WallController)
  .name;
