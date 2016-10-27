'use strict';

import angular from 'angular';
import routes from './owner.routes';
import OwnerController from './owner.controller';

export default angular.module('yoCollabaApp.owner', ['ui.router'])
  .config(routes)
  .controller('OwnerController', OwnerController)
  .name;
