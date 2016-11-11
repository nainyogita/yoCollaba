'use strict';

export default class HomeController {
  Auth;
  selectedTeamInfo = {};
  user = {};
  domain = '';
  teams = [];
  teamMembers = [];
  tm = [];

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
    console.log(this.selectedTeamInfo.members);
    this.teamMembers = [];
    angular.forEach(this.selectedTeamInfo.members, (email) => {
      var service = this.$http;
      this.$http.get('/api/users/getByEmail/' + email).then((response) => {

        var room = this.createRoomName(response.data);

        response.data.room = room;

        this.teamMembers.push(response.data);
        if (this.teamMembers.length === this.selectedTeamInfo.members.length) {
          this.getUnread();
        }
      });
    });
  }

  getUnread() {
    this.tm = [];
    console.log(this.teamMembers);
    angular.forEach(this.teamMembers, data => {
      console.log(data);

      this.$http.get('/api/chats/' + data.room).then(res => {
        console.log(res);
        data.unreadMsg = res.data.unreadMsg;
        this.tm.push(data);
        console.log(this.tm);
      });
    });

  }


  createRoomName(ou) {
    var room = '';
    if (ou.name.charAt(0) < this.user.name.charAt(0)) {
      room = ou.email + "-" + this.user.email;
    } else {
      room = this.user.email + "-" + ou.email;
    }

    return room;

  }

}
