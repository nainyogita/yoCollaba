'use strict';

import angular from 'angular';

export default class WallController {
  Auth;
  user={};
  selectedTeamInfo={};
  publicWall={};
  privateWall={};

/*@ngInject*/
  constructor(Auth, $state,$http) {
    this.Auth = Auth;
    this.$state = $state;
    this.message = 'Hello';
    this.$http = $http;
    this.showPublicWall = false;
    this.showPrivateWall = false;
    //this.showWall = false;
    this.publicWall={};
    this.user.name = Auth.getCurrentUserSync().name;
    this.user.email = Auth.getCurrentUserSync().email;
  }


  showWalls(teamInfo,type){

    if(type=='public'){
    this.showPublicWall = true;
      this.showPrivateWall = false;
  }
    if(type=='private'){
    this.showPrivateWall = true;
      this.showPublicWall = false;
  }

    this.selectedTeamInfo = teamInfo;

    //Get the domain of organization from thead domain
    this.domain = (this.selectedTeamInfo.thead[0]).split('@');
    this.domain = this.domain[this.domain.length-1];

    //After walls are fetched asynchronously, perform then() task
    this.getWalls().then((response) => {

      //Stores the response,i.e. json array of json object->organization in originalOrganisations array
      this.originalWalls = response.data;
      //call filter by approval Status
      this.filterWalls();

    });
  }

//Get walls from db
//TODO: Refactor --> shift code to service
  getWalls(){
    return this.$http.get('/api/walls').success(function(response){
    });
  }

//Filter privateWalls and public walls
  filterWalls(){
    this.originalWalls = this.originalWalls.filter((req)=>{
      return req.domain == this.domain;
    });

    this.publicWalls = this.originalWalls.filter((req)=>{
        return req.name === 'public';
      });

   this.publicWall = this.publicWalls[0];

   this.privateWalls = this.originalWalls.filter((req)=>{
    return req.name == this.selectedTeamInfo.name;
  });

  this.privateWall = this.privateWalls[0];
  }
}
