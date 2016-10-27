'use strict';

export default class HomeController{
  Auth;
  user = {};
  teams=[];
  /*@ngInject*/
  constructor(Auth, $state, TeamLeader) {
    this.team=false;
    this.Auth = Auth;
    this.$state = $state;
    this.homemessage = 'HomeController';
    this.User = TeamLeader;
    this.email = Auth.getCurrentUserSync().email;

    TeamLeader.getUserTeams({'email' : this.email}).$promise.then((data) => {
      this.teams=data;

    });

    this.User = TeamLeader;
  }

  $onInit() {

    this.Auth.getCurrentUser().then(response => {

      //Generate List of OnlineUsers
      this.user={
        id: response._id,
        name: response.name,
        email:response.email
      };
    });
  }

//Get information of selected team
//This info is used in nested views controller
  selectedTeam(team){
    this.selectedTeamInfo = team;
    this.team = true;

  }
}
