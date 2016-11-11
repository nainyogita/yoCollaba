'use strict';
// @flow

type User = {
  name: string;
  email: string;
  password: string;
};

export default class LoginController {
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

  /*@ngInject*/
  constructor(Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
  }

  /**
  *function called when user submits the form
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

           else this.$state.go('main');
          })
          .catch(err => {
            this.errors.login = err.message;
          });
      }
  }
}
