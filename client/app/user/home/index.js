'use strict';

import angular from 'angular';
import HomeController from './home.controller';

export default angular.module('gabfestApp.home', [])
  .controller('HomeController', HomeController)
  .name;
