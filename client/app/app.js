'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';
import uiNotification from 'angular-ui-notification';
import 'angular-socket-io';

import 'angularjs-dropdown-multiselect';
import 'lodash';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import ngMessages from 'angular-messages';
import ngValidationMatch from 'angular-validation-match';
import angularAria from 'angular-aria';
import angularAnimate from 'angular-animate';
import angularMaterial from 'angular-material';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import owner from './owner';
import user from './user';
import teamleader from './teamleader';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import organization from './organization/organization.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import './app.css';

angular.module('gabfestApp', [ngCookies, ngResource, ngSanitize,
    'btford.socket-io', uiRouter, uiBootstrap,
    _Auth, account, admin, owner, teamleader,
    navbar, user, footer, main,
    constants, socket, util,
    organization, ngFileUpload, uiNotification,
    'angularjs-dropdown-multiselect', angularAria,
    angularAnimate,
    ngMessages,
    ngValidationMatch,
    angularMaterial
  ])
  .directive('contenteditable', ['$sce', function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        };

        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          scope.$evalAsync(read);
        });
        read(); // initialize

        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if (attrs.stripBr && html == '<br>') {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    }
  }])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/main');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['gabfestApp'], {
      strictDi: true
    });
  });
