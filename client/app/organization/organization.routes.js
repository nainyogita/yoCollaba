'use strict';

//define the state and directive for organization template, controllers are created in organization.component.js
export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('organization', {
      url: '/organization',
      template: '<organization></organization>'
    });
}
