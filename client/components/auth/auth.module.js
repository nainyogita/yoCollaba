'use strict';

import angular from 'angular';
import constants from '../../app/app.constants';
import util from '../util/util.module';
import ngCookies from 'angular-cookies';
import {
  authInterceptor
} from './interceptor.service';
import {
  routerDecorator
} from './router.decorator';
import {
  AuthService
} from './auth.service';
import {
  UserResource
} from './user.service';
import {
  OwnerResource
} from './owner.service';
import{
  TeamleaderResource
} from './teamleader.service';
import{
  ChannelResource
} from './channel.service';
import{
  WallResource
} from './wall.service';
import{
  EmojiResource
} from './emoji.service';

import uiRouter from 'angular-ui-router';

function addInterceptor($httpProvider) {
  'ngInject';

  $httpProvider.interceptors.push('authInterceptor');
}

export default angular.module('gabfestApp.auth', [constants, util, ngCookies, uiRouter])
  .factory('authInterceptor', authInterceptor)
  .run(routerDecorator)
  .factory('Auth', AuthService)
  .factory('User', UserResource)
  .factory('Owner', OwnerResource)
  .factory('TeamLeader',TeamleaderResource)
  .factory('Channel', ChannelResource)
  .factory('Wall', WallResource)
  .factory('Emoji', EmojiResource)
  .config(['$httpProvider', addInterceptor])
  .name;
