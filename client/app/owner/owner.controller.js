'use strict';
// @flow
//Object structure to create a new team
type Org = {
  teams: {
    name: String,
    info: String,
    thead: [String]
  }
}

export default class OwnerController {

org : Org = {
  teams: {
    name: '',
    info: '',
    thead: [],//multiple heads of team
  }
};

  errors = {};
  submitted = false;
  Auth;
  $state;
  Owner;
  organization;
  name;  // name of the logged in user
  email; // EMAIL id of the logged in user
  resp;
  head;

  /*@ngInject*/
  constructor(Auth, $state, $http, Owner, User) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.Owner = Owner;

    // this.name = Auth.getCurrentUserSync().name;
    this.Auth.getCurrentUserSync().$promise.then(data =>{
      Owner.getTeam({'email' : data.email}).$promise.then((ownerData) => {
        this.organization = ownerData;
      });
    });
  }


  // To add members while creating channel
  addThead(){
    if(this.head != "" && (typeof this.head!='undefined'))
      this.org.teams.thead.push(this.head);
    this.head ="";
  }

  // Remove members while creating channel
  theadListRem(index){
    this.org.teams.thead.splice(index,1);
  }


  /**
  *  To add an new team
  *  @param {Object} form Json object containing new team information
  */
  addTeam(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.Auth.createTeam({
        teams: this.org.teams
      })
        .then((data) => {

          //Create Team Wall
          var teamWall = {
            name: this.org.teams.name,
            domain:this.organization.domain
          }

          this.$http.post('/api/walls/',teamWall).success(function(response){

          });

          // Account created, redirect to home
          this.$state.go('owner.dashboard');
        })
        .catch(err => {
          err = err.data;
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            teamForm[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }

  /**
  *  Delete a team
  *  @param {string} teamName - name of the team to be deleted
  */
  delete(teamName) {
    return this.Auth.deleteTeam({
      teamName: teamName
    })
      .then(() => {

        for(var i=0;i<this.organization.team.length ; i++){
          if(this.organization.team[i].name == teamName)
          {
            this.organization.team.splice(i,1);
            break;
          }
        }

        // Team deleted, redirect to home
        this.$state.go('owner.dashboard');
      })
      .catch(err => {
        err = err.data;
        this.errors = {};
        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, (error, field) => {
          teamForm[field].$setValidity('mongoose', false);
          this.errors[field] = error.message;
        });
      });
  }
}
