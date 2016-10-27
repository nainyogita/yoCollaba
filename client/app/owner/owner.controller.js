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

  errors = {
    // whatever we will req for example -->
    //login: undefined
  };
  submitted = false;
  Auth;
  $state;
  Owner;
  organization;
  name;
  email;
  resp;
  arr;
  head;
  /*@ngInject*/
  constructor(Auth, $state, $http, Owner, User) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.Owner = Owner;
    this.name = Auth.getCurrentUserSync().name;
    this.email = Auth.getCurrentUserSync().email;
    Owner.getTeam({'email' : this.email}).$promise.then((data) => {
      this.organization = data;
    });
  }


  // To add members while creating channel
  addThead(){
    this.org.teams.thead.push(this.head);
    this.head ="";
  }

  // Remove members while creating channel
  theadListRem(index){
    this.org.teams.thead.splice(index,1);
  }


  // To add an new team
  addTeam(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.Auth.createTeam({
        teams: this.org.teams
      })
        .then(() => {
          //Call the email API defined in server/app.js
          for(var i=0 ; i<this.org.teams.thead.length ; i++){
            //JSON object containing info used for sedning mail
            var postData = {
              email:this.org.teams.thead[i],
              name:this.org.teams.thead[i],
              password:'thead',
              message:'Request to join the team'
            };

            this.$http.post('/email', postData)
                .success(function(data) {
                  // Show success message

                })
                .error(function(data) {
                  // Show error message

                });

          }

          //Create Team Wall
          var teamWall = {
            name: this.org.teams.name,
            domain:this.organization.domain
          }

          this.$http.post('/api/walls/',teamWall).success(function(response){

          });


          // Account created, redirect to home
          this.$state.go('owner');
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

  // Delete a team
  /*TODO : on click delete the data is getting deleted from db but it shud
   be removed from page as well so the arr org teams dat will be created needs
   to be spliced --- it has been commented down
   */
  delete(teamName) {
    return this.Auth.deleteTeam({
      teamName: teamName
    })
      .then(() => {
        // Account created, redirect to home
        this.$state.go('owner');
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
