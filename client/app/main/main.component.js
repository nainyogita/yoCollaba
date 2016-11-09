import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

type User = {
  name: string;
  email: string;
  password: string;
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
  $http;
  socket;
  awesomeThings = [];
  newThing = '';
  errors = {};
  submitted = false;


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
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }

  /**
  *function to register the user
  */
  register(form) {
    this.submitted = true;

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
