'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './user.routes';
import chat from './chat';
import wall from './wall';
import home from './home';
import oauthButtons from '../../components/oauth-buttons';

export default angular.module('gabfestApp.user', [uiRouter, chat, wall, home,
    oauthButtons
  ])
  .config(routing)
  .run(function($rootScope) {
    'ngInject';

    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if(next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  })
  .name;
