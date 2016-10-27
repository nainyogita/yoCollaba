'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('teamleader', {
    url: '/teamleader',
    template: require('./teamleader.html'),
    controller: 'TeamleaderController',
    controllerAs: 'teamleader',
    authenticate: 'thead'
  })
  .state('editTeam', {
    url: '/edit',
    template: require('./editTeam.html'),
    controller: 'TeamleaderController',
    controllerAs: 'teamleader',
    authenticate: 'thead'
  })
  .state('teamleader.dashboard', {
    url: '/teamleaderDashboard',
    template: require('./dashboard.html'),
    controller: 'TeamleaderController',
    controllerAs: 'teamleader',
    authenticate: 'thead'
  })
  .state('teamleader.channel', {
    url: '/channels',
    template: require('./channel.html'),
    controller: 'TeamleaderController',
    controllerAs: 'teamleader',
    authenticate: 'thead'
  });
}
