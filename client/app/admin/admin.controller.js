'use strict';

export default class AdminController {
  users: Object[];

  originalOrg = []; //JSON Array containing all organizations in db
  orgRequests = []; //JSON Array created after filtering of oringalOrg[]

  /*@ngInject*/
  constructor($http,User) {
    // Use the User $resource to fetch all users
    this.users = User.query();
    this.$http = $http;
    this.showReq = false;
    this.filter = 'none';
    this.showOrg = true;

        //Calls getOrganizations function defined obove
        this.getOrganizations().then((response) => {
          //Stores the response,i.e. json array of json object->organization in originalOrganizations array
          this.originalOrg = response.data;

          //call filter by approval Status
          this.filterByApproval();
        });
  }

  //function to delete the user
  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }

 //Get all the organization stored in db, filtering is performed on client side, i.e, here
  //Can be further used for filtering
  getOrganizations(){
    return this.$http.get('/api/organizations').success(function(response){
    });
  }

  /**
  * Called when show Requests button is clicked from admin.html
  * shows all pending Requests
  */
  showRequests(){
    this.showReq = true ;
    this.showOrg = false;

  }

  /**
  * Called when show All Organization button is clicked from admin.html
  * shows all organizations
  */
  showOrgs(){
    this.showOrg = true ;
    this.showReq = false;
  }

  toggleHide(index){
    this.orgRequests[index].hide = !this.orgRequests[index].hide;
  }
  //Reset the filter to none, i.e it displays all organizations retrieved from database
  resetFilter(){
    this.filter = 'none';
    this.orgRequests = this.originalOrg;
  }

  filterByApproval(){
    this.resetFilter(); //Set originalOrg = orgRequests, i.e, both contain original data
    //adds those organizations to orgRequests whose approvalStatus == false

    //.filter is a js predefined function .. USED AS : abc.filter in js file.... abc|filter in html file
    this.orgRequests = this.orgRequests.filter(function(req){
      return req.approvalStatus === false;
    });
    this.filter = 'FILTER --> approvalStatus: false';
  };

  //Called once the admin accepts the request
  acceptReq(id,owner,index){

    this.orgRequests[index].action = "Accepted"

    var ele = {approvalStatus:true};

    //Update the approvalStatus in db
    this.$http.put('/api/organizations/'+id, ele).success(function(response){});



    var saveOwner = {
      email: owner.email,
      name: owner.name,
      role:'owner',
      password: 'owner'
    };

    this.$http.post('/api/users/',saveOwner).success(function(response){

    });

    var publicWall = {
      name: 'public',
      domain:this.orgRequests[index].domain
    }

    this.$http.post('/api/walls/',publicWall).success(function(response){

    });
    //JSON object containing info used for sedning mail
    var postData = {
      email: owner.email,
      name: owner.name,
      message: 'This email is to notify you that your request for'+
      ' registering your Organization has been accepted.Welcome to '
      +'the gabfest family!!',
      password:'owner'
    };

    /**Call the email API defined in server/app.js
     * @param {json} postData -  containing data to be emailed amd user details
     * @return success or fail
     */
    this.$http.post('/email', postData)
    .success(function(data) {})
    .error(function(data) {});

  }

  //Reject Request
  rejectReq(id,index){
  this.orgRequests[index].action = "Rejected!";

    //IF WE WANT TO DELETE THE REJECTED REQUEST FROM DB
    //TODO : Modify it to keep the rejected req in db
    this.$http.delete('/api/organizations/'+id).success(function(response){

    });
  }
}
