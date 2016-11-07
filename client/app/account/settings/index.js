'use strict';

import angular from 'angular';
import SettingsController from './settings.controller';

export default angular.module('gabfestApp.settings', [])
  .controller('SettingsController', SettingsController)
  .name;
