'use strict';

import angular from 'angular';
import routes from './teamleader.routes';
import TeamleaderController from './teamleader.controller';

export default angular.module('gabfestApp.teamleader', ['ui.router'])
  .config(routes)
  .controller('TeamleaderController', TeamleaderController)
  .name;
