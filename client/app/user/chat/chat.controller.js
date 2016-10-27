'use strict';

import angular from 'angular';


type WallPost = {
  name: string,
  domain:string,
  posts: {title:string, image:string, description: string, author:string }
}


export default class ChatController {
  wallPost: WallPost = {
    name: '',
    domain:'',
    posts: [{title:'', image:'abc.png',description: '',author:'' }]
  };

  Upload;
  Auth;
  Wall;
  user={};
  email='';
  f={};
  participants=[];
  privateChannels=[];
  publicChannels=[];
  onlineUsers = [];
  selectedTeamInfo={};
  selectedChannel = {};
  domain='';
  wallPost={};
  tempWall={};
  roomName='';
  message='';
  chatHistory=[];
  emojiList;

  /*@ngInject*/
  constructor(Auth, $state,socket,Upload,$http,Emoji) {

    //this.Wall = Wall;
    this.socket=socket;
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.messagegreet = 'Chat ChatController';
    this.Upload = Upload;
    this.chShow=false;
    this.progressVisible=false;
    this.pc = false;
    this.pinned = false;

    this.user.name = Auth.getCurrentUserSync().name;
    this.user.email = Auth.getCurrentUserSync().email;

        /**
    * Bring on all the emojis here
    */
    this.emojiList = Emoji.getEmojis().$promise.then((data) => {
      this.emojiList = data;
    });
  }

    addThisEmoji(key, value){
    /**
    * @param {String} key The text equivalent of the emoji
    * @param {String} value The visual equivalent of the emoji
    */
    key = ':' + key + ':';
    this.message = this.message + ' ' + value + ' ';
  }

  //Toggle var for wall pinned posts
  toggleHide(index){
    this.chatHistory[index].hide = !this.chatHistory[index].hide;
  }

  //Show all channels of the team selected
  showChannels(teamInfo){
    this.chShow=true;
    this.selectedTeamInfo = teamInfo;



    //Get the domain of organization from thead domain

    this.domain = (this.selectedTeamInfo.thead[0]).split('@');
    this.domain = this.domain[this.domain.length-1];


    //Get channels which are part of this team
    this.channels = this.selectedTeamInfo.channel;

    this.filterPrivateChannelByMember();
    this.filterPublicChannel();
  }

  //Filter private Channels, filter private channels of the member
  filterPrivateChannelByMember(){
    this.privateChannels = this.channels.filter((req)=>{
      return !(req.name === 'public');
    });

    this.privateChannels = this.privateChannels.filter((req)=>{
      return req.members.includes(this.user.email);
    });
  };

  //Filter public channel from the list of all channels of team
  filterPublicChannel(){
    this.publicChannels = this.channels.filter((req)=>{
      return req.name === 'public';
    });
  }

  //TODO: Refactor code to service
  //Get all walls from the walls db
  getWalls(){
    return this.$http.get('/api/walls').success(function(response){
    });
  }

  //Save the chat message to be pinned to the wall
  saveForWall(writer,message){

    this.pinned = true;
    this.wallPost = {
      title:'Wall Post',
      description:message,
      author:writer
    }

    this.getWalls().then((response) => {
      //Stores the response,i.e. json array of json object->organization in originalOrganisations array
      this.originalWalls = response.data;
      //call filter by approval Status
      this.filterWalls();
    });
  }

  //add Post to the wall
  addWallPost(){
    var tempPostArr = this.tempWall.posts;
    tempPostArr.unshift(this.wallPost);
    var post={posts:tempPostArr};
    this.$http.put('/api/walls/'+this.tempWall._id,post).success(function(response){
      //

    });
  }

  //Filter private and public walls
  filterWalls(){
    this.originalWalls = this.originalWalls.filter((req)=>{
      return req.domain == this.domain;
    });

    if(this.selectedChannel.name == 'public'){
      this.originalWalls = this.originalWalls.filter((req)=>{
        return req.name === 'public';
      });
    }
    else{
      this.originalWalls = this.originalWalls.filter((req)=>{
        return req.name == this.selectedTeamInfo.name;
      });

    }
    this.tempWall = this.originalWalls[0];

    this.addWallPost();
    //
  }

  //Called when show Reqests button is clicked from admin.html
  showRequests(){
    this.showReq = true; //sets showReq = true, used for show/hide of req table
  }

  $onInit() {
    this.Auth.getCurrentUser().then(response => {
      //Generate List of OnlineUsers
      this.user={
        id: response._id,
        name: response.name,
        email:response.email
      };

      this.socket.onlineUsers(this.user);
      this.socket.syncOnlineUsers(data => {

        //TODO: Check if online user is a part of this team
        this.onlineUsers = data;
      });

      this.socket.syncUpdateChat(data => {
        this.chatHistory.push({
          sender: data.sender,
          message: data.message
        });
      });
    });
  }

  //Initiate group chat, create room
  groupChat(channelInfo){
    //TODO:Get ChannelInfo from Db
    //  this.roomName = channelInfo.name;
    this.chatHistory=[];
    this.pc = false;
    this.selectedChannel = channelInfo;

    //ChatRoom Name = Organization Domain + Team Name + ChannelName
    this.roomName = this.domain + this.selectedTeamInfo.name + channelInfo.name;
    this.socket.room(this.roomName);
  }

  //Initiate private chat, create private room
  privateChat(ou){
    this.chatHistory=[];
    //A user can establish privateChat with only one user at a time,
    // i.e participants.length <=2
    this.pc = true;
    if(this.participants.length!=0){
      this.participants = [];
    }

    //Add both to participants for storing in db
    this.participants.push(ou);
    this.participants.push(this.user);

    //Generate a common room name
    if(ou.name.charAt(0) < this.user.name.charAt(0))
    {
      this.roomName = ou.email + "-"+this.user.email;
    }
    else {
      this.roomName = this.user.email+"-"+ ou.email;
    }
    this.socket.room(this.roomName);
  }

  //upload file to server on file select
  upload(file) {
      console.log("inside upload");
      console.log(file);
      this.progressVisible=true;
      this.f=file;

      file.upload =  this.Upload.upload({
        url: '/chat/upload',
        data: {file: file, 'username': this.user.name}
      }).then((resp) => {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);

        var extn = resp.config.data.file.name.split(".").pop();
        var msg= "<a href='./../../server/uploads/"+ file.name+"'><img src ='"+this.getImage(extn,resp.config.data.file.name)+"' alt='img' height='40' width='40'"+ file.name + "</a><b>"+file.name+"</b>";
        this.socket.sendMessage({
          'sender': this.user.name,
          'message': msg,
          'room': this.roomName
        });

      }, (resp) => {
        console.log('Error status: ' + resp.status);
      }, (evt) => {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        this.f.progress = progressPercentage;
        if(progressPercentage == 100){

        }
      });
    };

  sendMessage() {
    this.pinned=false;
    this.progressVisible=false;

    //If the input field is not empty
    if (this.message) {
      //regex for urls
      var urlRegex =/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

      //if the message is a url then perform url scrapping
      if(urlRegex.test(this.message)){
        this.$http.get("https://api.embedly.com/1/extract?url=" + this.message
        + "&key=5a12e99bc47c478193b26e221b296479").then((data,status)=>{

            this.message = '<a href="' + data.data.url +
            '" target="_blank"/><blockquote><img src="' +
             data.data.favicon_url + '"/><p>' + data.data.provider_name +
             '</p><span>' + data.data.description + '</span></blockquote></a>';

             this.sendMsgToServer();
             this.message = '';
          });

        }
        else{
          this.sendMsgToServer();
          this.message = '';
        }

    }
  }

//send a message to the server
  sendMsgToServer(){
    //Emit the socket with senderName, message and channelId
    this.socket.sendMessage({
      'sender': this.user.name,
      'message': this.message,
      'room': this.roomName
    });
  }


  getImage(extension,fname){
    var name;
    switch (extension) {
      case 'docx':
        name='assets/images/doc.png';
        break;
      case 'xls':
        name='assets/images/excel.png';
        break;
      case 'pdf':
        name='assets/images/pdf.png';
        break;
      case 'png':
        name='./../../server/uploads/'+fname;
        break;
      default:
        name='assets/images/collaba.png';
    }
    return name;
  }
}
