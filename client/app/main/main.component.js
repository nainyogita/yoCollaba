import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

type User = {
  name: string;
  email: string;
  password: string;
};

type Org = {
  name: string,
  owner:{name: string, email: string},
  domain:string,
  approvalStatus:boolean
};

export class MainController {
  Auth;
  $state;
  isLoggedIn:Function;
  user: User = {
    name: '',
    email: '',
    password: ''
  };
  org: Org = {
    name: '',
    owner:{name: '', email: ''},
    domain:'',
    approvalStatus:false
  };
  $http;
  socket;
  awesomeThings = [];
  newThing = '';
  errors = {};
  orgSubmitted = false;
  userSubmitted = false;

  /*@ngInject*/
  constructor($http, $scope, socket,Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.socket = socket;
    this.isLoggedIn = Auth.isLoggedInSync;
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
    this.message = 'Hello';
    this.orgSubmitted = false;
    this.userSubmitted = false;
  }

  $onInit() {

  }

  /**
  *   save the organization in db with approvalStatus=false on request for
  *   'register organization'
  *   @param {JSON} org - The organization to be registered
  *   @extends register(form) function
  */
  registerOrg(org) {

    return this.$http.post('/api/organizations', org)
    .success((response) => {

      if(response.status === "EXISTS"){
        //Show error
        this.submitted = false;
      }
      else if(response.status === "NO"){
        //Redirect to the URL
        this.orgSubmitted = true;
      }

    })
    .error(function(response){
    });
  }


/**
 * save the organization in db with approvalStatus=false on request for
 *   'register organization'
 * @param  {Object} form The form data organization to be registered
 * @return {function} registerOrg The function that calls api for registration
 */
    registerFormOrg(form) {

    //Get domain of organization from email of owner
    var domain = (this.org.owner.email).split('@');
    var len = domain.length;
    domain = domain[len-1];
    this.org.domain = domain;

    //checks validity of form
  //  if(form.$valid) {

      //call registerOrg function defined above
      return this.registerOrg(this.org)
      .then(() => {
        //  organization data succeddfully stored in db
        this.org = {}; //empty the form values for org object
      });
  //  }
  }


/**
 * [register description]
 * @param  {Object} form The form data organization to be registered
 */
  register(form) {
    this.userSubmitted = true;

    //checks the validity of form
    if(form.$valid) {
      return this.Auth.createUser({
        name: this.user.name,
        email: this.user.email,
        status: true,
        password: this.user.password
      })
        .then((res) => {
          // Account created, redirect to home
          this.$state.go('main');
        })
        .catch(err => {
          err = err.data;
          this.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }
}

export default angular.module('gabfestApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
