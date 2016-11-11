'use strict';
/* eslint no-sync: 0 */
import angular from 'angular';
type User = {
  name: string;
  email: string;
  password: string;
};
export class NavbarComponent {
  user: User = {
    name: '',
    email: '',
    password: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;
  Auth;
  $state;
  menu = [{
    title: 'Home',
    state: 'main'
  }];
  isLoggedIn: Function;
  isAdmin: Function;
  isOwner: Function;
  isUser:Function;
  isTeamleader:Function;
  getCurrentUser: Function;
  isCollapsed = true;
  constructor(Auth, $state) {
    'ngInject';
    this.Auth = Auth;
    this.$state = $state;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.isOwner = Auth.isOwnerSync;
    this.isUser = Auth.isUserSync;
    this.isTeamleader = Auth.isTeamleaderSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
  }
  /**
   * Function called when user submits the form
   * @param  {Object} form login form data
   */
  login(form) {
    this.submitted = true;
    if(form.$valid) {
        this.Auth.login({
          email: this.user.email,
          password: this.user.password
        })
          .then((res) => {
            // Logged in, redirect to home
            if(res.role == 'admin')
              this.$state.go('admin');
            else if(res.role == 'user')
              this.$state.go('home');
            else if(res.role == 'owner')
              this.$state.go('owner.dashboard');
            else if(res.role == 'thead')
              this.$state.go('teamleader.dashboard');
           else this.$state.go('main');
          })
          .catch(err => {
            this.errors.login = err.message;
          });
      }
  }//login ends here
}
export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
