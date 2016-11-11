'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './organization.routes';

type Org = {
  name: string,
  owner:{name: string, email: string},
  domain:string,
  approvalStatus:boolean
};

export class OrganizationComponent {
  org: Org = {
    name: '',
    owner:{name: '', email: ''},
    domain:'',
    approvalStatus:false
  };
  errors = {};
  submitted = false;
  $http;


  /*@ngInject*/
  constructor($http) {
    this.message = 'Hello';
    this.submitted = false;
    this.$http = $http;
  }

  /**
  *   save the organization in db with approvalStatus=false on request for
  *   'register organization'
  *   @param {Object} org - The organization to be registered
  *   @extends register(form) function
  */
  registerOrg(org) {

    return this.$http.post('/api/organizations', org)
    .success((response) => {
      if(response === "EXISTS"){
        //Show error
        this.submitted = false;
      }
      else if(response === "NO"){
        //Redirect to the URL
        this.submitted = true;
      }
    })
    .error(function(response){
    });
  }

  /**
  *   save the organization in db with approvalStatus=false on request for
  *   'register organization'
  *   @param {Object} form - The form data organization to be registered
  */  register(form) {

    //Get domain of organization from email of owner
    var domain = (this.org.owner.email).split('@');
    var len = domain.length;
    domain = domain[len-1];
    this.org.domain = domain;

    //checks validity of form
    if(form.$valid) {

      //call registerOrg function defined above
      return this.registerOrg(this.org)
      .then(() => {
        //  organization data succeddfully stored in db
        this.org = {}; //empty the form values for org object
        //  IGNORE -- > this.$state.go('login');
      });
    }
  }
}

/**
*defines the component, the template for <organization></organization>
*used in organization.routes.js is specified here
*controller as vm specifies how the scope of controller will be accessed,
i.e, this = vm inside the scope of controller.
*/
export default angular.module('gabfestApp.organization', [uiRouter])
.config(routes)
.component('organization', {
  template: require('./organization.html'),
  controller: OrganizationComponent,
  controllerAs: 'vm'
})
.name;
