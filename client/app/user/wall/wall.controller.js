'use strict';

import angular from 'angular';

export default class WallController {
  Auth;
  user = {};
  selectedTeamInfo = {};
  publicWall = {};
  team = {};
  privateWall = {};

  /*@ngInject*/
  constructor(Auth, $state, $http, $scope) {
    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.message = 'Hello';
    this.$http = $http;
    this.showPublicWall = false;
    this.showPrivateWall = false;
    this.publicWall = {};
    this.user.name = Auth.getCurrentUserSync().name;
    this.user.email = Auth.getCurrentUserSync().email;
    this.team = $scope.$parent.vmHome.selectedTeamInfo;

  }

  showWalls(teamInfo, type) {

    if (type == 'public') {
      this.showPublicWall = true;
      this.showPrivateWall = false;
    }


    if (type == 'private') {
      this.showPrivateWall = true;
      this.showPublicWall = false;
      this.selectedTeamInfo = teamInfo;
    }

    //Get the domain of organization from users email domain
    this.domain = (this.user.email).split('@');
    this.domain = this.domain[this.domain.length - 1];

    //After walls are fetched asynchronously, perform then() task
    this.getWalls().then((response) => {
      //Stores the response,i.e. json array of json object->organization in originalOrganisations array
      this.originalWalls = response.data;
      this.filterWalls();
    });
  }

  //Get walls from db
  //TODO: Refactor --> shift code to service
  getWalls() {
    return this.$http.get('/api/walls').success(function(response) {});
  }

  //add Post to the wall
  addWallPost(type) {

    var tempPostArr;

    this.wallPost = {
      title: this.wallPostTitle,
      description: this.wallPostDescription,
      author: this.user.name
    }

    if (type == 'private') {
      tempPostArr = this.privateWall.posts;
      this.tempWall = this.privateWall;
    }

    if (type == 'public') {
      tempPostArr = this.publicWall.posts;
      this.tempWall = this.publicWall;
    }

    tempPostArr.unshift(this.wallPost);

    this.$http.put('/api/walls/' + this.tempWall._id, {
      posts: tempPostArr
    }).success((response) => {
      //
      this.wallPostTitle = '';
      this.wallPostDescription = '';
    });
  }

  deleteWallPost(type, index) {

    var tempPostArr;

    if (type == 'private') {
      tempPostArr = this.privateWall.posts;
      this.tempWall = this.privateWall;
    }

    if (type == 'public') {

      tempPostArr = this.publicWall.posts;
      this.tempWall = this.publicWall;
    }

    tempPostArr.splice(index, 1);

    this.$http.put('/api/walls/' + this.tempWall._id, {
      posts: tempPostArr
    }).success((response) => {
      console.log(response);
    });
  }

  //Filter privateWalls and public walls
  filterWalls() {
    //get walls of this domain
    this.originalWalls = this.originalWalls.filter((req) => {
      return req.domain == this.domain;
    });

    this.publicWalls = this.originalWalls.filter((req) => {
      return req.name === 'public';
    });
    this.publicWall = this.publicWalls[0];
    console.log(this.publicWall);

    this.privateWalls = this.originalWalls.filter((req) => {
      return req.name == this.selectedTeamInfo.name;
    });

    this.privateWall = this.privateWalls[0];
  }

}
