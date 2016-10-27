'use strict';
// @flow
//Object structure to create a new team
type Team = {
  member: String,
  teamName: String
}

export default class TeamleaderController {

  team : Team = {
    member: '',
    teamName: ''
  };

  errors = {
    // whatever we will req for example -->
    //login: undefined
  };
  submitted = false;
  Auth;
  $state;
  teamSelected;

  selectedOption=null;
  channelJSON;
  Team;
  Channel;
  email;
  parent;
  member;

  /*@ngInject*/
  constructor(Auth, $state, $http, $rootScope, Owner, User, TeamLeader, Channel) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.parentScope = $rootScope;
    this.channelJSON = {members:[],type:true};
    this.name = Auth.getCurrentUserSync().name;
    this.email = Auth.getCurrentUserSync().email;
    TeamLeader.getTeams({'email' : this.email}).$promise.then((data) => {
      this.teamInfo = data;
      this.selectedOption = this.teamInfo[0];
    });

    this.Channel = Channel;
    this.TeamLeader = TeamLeader;
  }//constructor

  /* function to change the current selected team */
  changeSelectedTeam(team){
    this.teamSelected = team;
    this.parentScope.team = team;
  }

  /* assign name of team in which memeber will be added */
  add(name){
    this.nameSelected = name;
  }

  /* Form to edit the credentials of the team */
  edit(form,id){
    this.submitted = true;

    if(form.$valid) {
      this.TeamLeader.teamEdit({'JSON' : {'id':this.parentScope.team._id,'name':this.parentScope.team.name,'info':this.parentScope.team.info}});
      this.$state.go('teamleader.dashboard');
      this.submitted = false;
    }
  }


  // To add members while creating channel
  addChannelMember(){
    this.channelJSON.members.push(this.member);
    this.member ="";
  }

  // Remove members while creating channel
  memListRem(index){
    this.channelJSON.members.splice(index,1);
  }

  // To add a new team member
  addTeamMember(form) {
    this.submitted = true;

    if(form.$valid) {

      return this.Auth.addTeamMember({
        member: this.team.member,
        teamName: this.nameSelected
      })
      .then(() => {
        //Call the email API defined in server/app.js
        //JSON object containing info used for sedning mail
        var postData = {
          email:this.team.member,
          name:this.team.member,
          password:'default',
          message:'Request to join the team'
        };

        this.$http.post('/email', postData)
        .success(function(data) {
          // Show success message
        })
        .error(function(data) {
          // Show error message
        });

        // Account created, redirect to home
        this.$state.go('teamleader');
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
    this.submitted = false;
  }

  // TODO :Remove a team member
  deleteTeamMember(teamMember) {

    // ....
  }

  /* adding a channel into a team */
  addChannel(){
    console.log("-------channel---------");
    this.channelJSON.type = this.channelJSON.type?'public':'private';
    console.log(this.channelJSON);
    this.Channel.addChannel({'JSON' : this.channelJSON, 'teamId' : this.selectedOption._id, 'teamLeader' : this.email });
    this.$state.go('teamleader.dashboard');
  }
}
