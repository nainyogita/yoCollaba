'use strict';
// @flow

type User = {
  username: string,
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default class SettingsController {
  user: User = {
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errors = {
    other: undefined
  };
  message = '';
  submitted = false;
  Auth;

  /*@ngInject*/
  constructor(Auth) {
    this.Auth = Auth;
    this.user.username = Auth.getCurrentUserSync().name;
  }

  /**
  *function for changing user password
  */
  changePassword(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword,this.user.username)
        .then(() => {
          this.Auth.getCurrentUserSync().name = this.user.username;
          this.message = 'Credentials successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
}
