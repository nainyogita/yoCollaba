'use strict';

export default class HomeController {
  Auth;
  selectedTeamInfo = {};
  user = {};
  domain = '';
  teams = [];
  teamMembers = [];

  /*@ngInject*/
  constructor(Auth, $state, $scope, TeamLeader, socket, $http) {
    this.$http = $http;
    this.socket = socket;
    this.team = false;
    this.Auth = Auth;
    this.$state = $state;
    this.homemessage = 'HomeController';
    this.email = Auth.getCurrentUserSync().email;

    TeamLeader.getUserTeams({
      'email': this.email
    }).$promise.then((data) => {
      this.teams = data;
    });
  }

  $onInit() {

    this.Auth.getCurrentUser().then(response => {

      this.user = {
        id: response._id,
        name: response.name,
        email: response.email
      };

      this.domain = (response.email).split('@');
      this.domain = this.domain[this.domain.length - 1];

    });
  }

  //Get information of selected team
  //This info is used in nested views controller
  selectedTeam(team) {

    this.selectedTeamInfo = team;
    this.team = true;
    this.getTeamMembers();
  }

  getTeamMembers() {
    
    this.teamMembers = [];
    angular.forEach(this.selectedTeamInfo.members, (email) => {

      this.$http.get('/api/users/getByEmail/' + email).then((response) => {

        this.teamMembers.push(response.data);
      });

    });
  }
}
