'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('owner', {
    url: '/owner',
    template: require('./owner.html'),
    controller: 'OwnerController',
    controllerAs: 'owner',
    authenticate: 'owner'
  })
  .state('owner.dashboard', {
    url: '/ownerDashboard',
    template: require('./dashboard.html'),
    controller: 'OwnerController',
    controllerAs: 'owner',
    authenticate: 'owner'
  })
  .state('owner.team', {
    url: '/ownerTeam',
    template: require('./teams.html'),
    controller: 'OwnerController',
    controllerAs: 'owner',
    authenticate: 'owner'
  });
}
