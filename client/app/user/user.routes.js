'use strict';

export default function($stateProvider) {
  'ngInject';

  $stateProvider.state('home.chat', {
      url: '/chat',
      template: require('./chat/chat.html'),
      controller: 'ChatController',
      controllerAs: 'vm',
      authenticate: true
    })
    .state('home.wall', {
      url: '/wall',
      template: require('./wall/wall.html'),
      controller: 'WallController',
      controllerAs: 'vm',
      authenticate: true
    })
    .state('home', {
      url: '/home',
      template: require('./home/home.html'),
      controller: 'HomeController',
      controllerAs: 'vmHome',
      authenticate: true
    });
}
