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
  selectedOptionToShow = null;
  channelJSON;
  Team;
  Channel;
  email;
  parent;
  member;
  channelList = null;
  channelBlob = null;

  channelInfoCopy = null;

  /**
   * List of members in the selected team, aka selectedOptionToShow
   * @type {Array}
   */
   membersList = null;
   membersListSelected = null;

  //For the edit button : off when the edit btn is being shown
  modeOff;

  //For the save button : on when the save btn is being shown
  modeOn;

  /*@ngInject*/
  /**
   * Used to initialize the TeamLeader's prerogatives and variables
   * @param  {Object} Auth       The Auth resource imported froom server end
   * @param  {Object} Owner      The Owner resource imported froom server end
   * @param  {Object} User       The User resource imported froom server end
   * @param  {Object} TeamLeader The TeamLeader resource imported froom server end
   * @param  {Object} Channel    The Channel resource imported froom server end
   * @param  {Object} $state     Angular's inbuilt scope object
   * @param  {Function} $http      Angular's inbuilt http method
   * @param  {Object} $rootScope Angular's inbuilt rootScope object
   */
  constructor(Auth, Owner, User, TeamLeader, Channel, $state, $http, $rootScope) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.parentScope = $rootScope;
    this.channelJSON = {members:[], type:true};

    this.Auth.getCurrentUserSync().$promise.then(data =>{
      TeamLeader.getTeams({'email' : data.email}).$promise.then((data) => {
        this.teamInfo = data;
        this.selectedOption = this.teamInfo[0];
        /**
        * This block is for the dropdowns on the left
        */
        this.selectedOptionToShow = this.teamInfo[0];
        this.channelList =  this.teamInfo[0].channel;
        this.channelShown = this.teamInfo[0].channel[0];
        this.channelBlob = this.teamInfo[0].channel[0];
        /**
         * This is to set the options of the dropdown initially
         */
        this.getTeamMembers();
      });
      this.Channel = Channel;
      this.TeamLeader = TeamLeader;
      this.modeOff = true;
      this.modeOn = false;
      this.channelInfoCopy = {};
    });
  }

  // Set of functions to edit the existing channel information

  /**
   * Get the list of channels corresponding to the selected values
   * @param  {Array} team Array of teams under the current TeamLeader
   * @return {Array}      A list of channels in the selected team
   */
  getChannels(team){
    var teamArray = team;
    var selectedTeamName = this.selectedOptionToShow.name;
    for(var idx = 0; idx < teamArray.length; idx++ ) {
      if(teamArray[idx]['name'] === selectedTeamName){
        this.channelList = teamArray[idx]['channel'];
        return;
      }
    }
  }

    /**
    * Get all members in the selected team
    * @return {Array} Array of members in the team selected
    */
   getTeamMembers() {
     this.membersListSelected = [];
     var team = this.selectedOptionToShow;
     var channels = team.channel;
     for( var idx = 0; idx < channels.length; idx++ ) {

       if( channels[idx]['name'] === 'public' && channels[idx]['type'] === 'public') {
         this.membersList = channels[idx]['members'];
         this.membersList = this.membersList.map(function(member){
           return {
             "label" : member,
             "id" : member
           }
         });
       }
     }
   }

  /**
   * Get the channel information from here
   * @param  {Array} channelArr List of channles in the selected Team
   * @return {Object}            A single channel as selected for display
   */
  displayChannel(channelArr) {
    var selected = this.channelShown;
    for(var idx = 0; idx < channelArr.length; idx++ ) {
      if(channelArr[idx]['name'] === selected.name){
        this.channelBlob = channelArr[idx];
        return;
      }
    }
  }

  /**
   * Turn the channel information boxes ( except members ) editable as such
   */
  showEditableBoxes(){
    this.modeOff = false;
    this.modeOn = true;
    var element = document.querySelectorAll("div[contenteditable=\"false\"]");
    element.forEach(function(div){
      div.setAttribute("contenteditable", true);
    });
    /**
     * This is supposed to be some sort of weird stuff
     * Basically this does not create a reference but
     * copies the data at
     * @type {Object}
     */
    this.channelInfoCopy = JSON.parse(JSON.stringify(this.channelBlob));
  }

  /**
   * Supposed to lock the editable boxes and save the data
   */
  lockEditableBoxes(){
    // Turn the edit mode off first
    this.modeOn = false;
    this.modeOff = true;
    // Method to first convert editables to false
    var element = document.querySelectorAll("div[contenteditable=\"true\"]");
    element.forEach(function(div){
      div.setAttribute("contenteditable", false);
    });
    // Then save the data here
    this.updateChannel();
  }

  /**
   * Supposed to reject all the work that you might have done
   */
  rejectEditableBoxes(){
    // Turn the edit mode off first
    this.modeOn = false;
    this.modeOff = true;
    // Method to first convert editables to false
    var element = document.querySelectorAll("div[contenteditable=\"true\"]");
    element.forEach(function(div){
      div.setAttribute("contenteditable", false);
    });
    // Simply revert to the original state
    this.channelBlob = this.channelInfoCopy;
  }

  /**
  * Get a trimmed array out of the given JSON of muliselect
  * @param  {Array} array An array of JSONs
  * @return {Array}       A plain array
  */
   getTrimmed(array){
     return array.map(function(data) {
       return data['id'];
     });
   }

   /**
    * Update the channel information
    */
   updateChannel() {
     var newMembers = this.membersListSelected.map(function(data){
       return data['id'];
     });
     this.channelBlob.members = this.channelBlob.members
                               .concat(newMembers);
     /**
      * Removing duplicates the ES6 set way
      * @type {Array}
      */
     this.channelBlob.members = Array.from(new Set(this.channelBlob.members));
     var teamName = this.selectedOptionToShow.name;
     this.Channel.updateChannel({'name' : teamName, 'blob' : this.channelBlob});
     this.$state.go('teamleader.dashboard');
   }

  //One block ends here

  /* function to change the current selected team */
  changeSelectedTeam(team){
    this.teamSelected = team;
    this.parentScope.team = team;
    this.getTeamMembers();
  }

  /* assign name of team in which member will be added */
  add(name){
    if(name != "" && (typeof name!='undefined'))
      this.nameSelected = name;
  }

  /**
   * Form to edit the credentials of the team
   * @param  {Object} form Team information to be edited
   * @param  {string} id   Team id to be edited
   */
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
    if(this.member != "" && (typeof this.member!='undefined'))
      this.channelJSON.members.push(this.member);
    this.member ="";
  }


/**
 * Remove members while creating channel
 * @param  {integer} index index of member to be spliced
 */
  memListRem(index){
    this.channelJSON.members.splice(index,1);
  }


/**
 * To add a new team member
 * @param {Object} form Json Object to add team member
 */
  addTeamMember(form) {
    this.submitted = true;
    if(form.$valid) {

      return this.Auth.addTeamMember({
        member: this.team.member,
        teamName: this.nameSelected
      })
      .then(() => {
        // Account created, redirect to home
        this.$state.go('teamleader.dashboard');
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

  /**
   * [isEmpty description]
   * @param  {String}  string String to be checked
   * @return {Boolean}        Whether the string is empty or not
   */
  isEmpty(string) {
    return typeof string == 'string' && !string.trim() || typeof string == 'undefined' || string === null;
  }

  /**
   * Checks if the credentials to add team are empty or not
   * @return {Boolean} Whether the JSON has any empty values or not
   */
  checkForEmptyValues(){
    if(this.isEmpty(this.channelJSON.name) === true)
      return true;
    if(this.isEmpty(this.channelJSON.info) === true)
      return true;
    return false;
  }

  /**
   * Add a channel to the database
   */
  addChannel(){
    if(this.checkForEmptyValues() === false) {
      this.channelJSON.type = this.channelJSON.type?'public':'private';
      this.Channel.addChannel({'JSON' : this.channelJSON, 'teamId' : this.selectedOption._id, 'teamLeader' : this.email });
      this.$state.go('teamleader.dashboard');
    }
  }
}
