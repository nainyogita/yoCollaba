'use strict';

import angular from 'angular';

type WallPost = {
  name: string,
  domain: string,
  posts: {
    title: string,
    image: string,
    description: string,
    author: string
  }
}

export default class ChatController {
  wallPost: WallPost = {
    name: '',
    domain: '',
    posts: [{
      title: '',
      image: 'abc.png',
      description: '',
      author: ''
    }]
  };

  Upload;
  Auth;
  Wall;
  user = {};
  email = '';
  f = {};
  participants = [];
  privateChannels = [];
  publicChannels = [];
  onlineUsers = [];
  selectedTeamInfo = {};
  selectedChannel = {};
  team = {};
  domain = '';
  wallPost = {};
  tempWall = {};
  roomName = '';
  message = '';
  chatHistory = [];
  emojiList;
  TeamLeader;
  allowLeaving;
  typing;


  /*@ngInject*/
  constructor(Auth, $state, socket, Upload, $http, $scope, Notification, Emoji,TeamLeader) {

    this.socket = socket;
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.messagegreet = 'Chat ChatController';
    this.TeamLeader = TeamLeader;
    this.allowLeaving = true;
    this.Upload = Upload;
    this.chShow = false;
    this.progressVisible = false;
    this.pc = false;
    this.Notification = Notification;
    this.pinned = false;
    this.typing = '';

    this.team = $scope.$parent.vmHome.selectedTeamInfo;

    $scope.$on('$destroy', function() {
      socket.logout();
    });

    /**
     * Bring on all the emojis here
     */
    this.emojiList = Emoji.getEmojis().$promise.then((data) => {
      this.emojiList = data;
    });
  }

  $onInit() {

    this.Auth.getCurrentUser().then(response => {

      this.user = {
        id: response._id,
        name: response.name,
        email: response.email
      };

      this.socket.onlineUsers(this.user);

      //Generate List of OnlineUsers
      this.socket.syncOnlineUsers(data => {

        this.onlineUsers = data;
        //Connect to all Rooms
        angular.forEach(this.onlineUsers, (ou) => {

          var room = '';
          if (ou.name.charAt(0) <= this.user.name.charAt(0)) {
            room = ou.email + "-" + this.user.email;
          } else {
            room = this.user.email + "-" + ou.email;
          }
          //Connect to rooms for all online users
          this.socket.room(room);
        });
      });


      this.socket.syncUpdateChat(data => {

        //If the chat window is open , dont send Notification
        //Send notifications for other rooms
        if (data.room != this.roomName) {
          this.Notification.primary('New message from' + data.sender);
        } else {
          this.chatHistory.push({
            sender: data.sender,
            message: data.message
          });
        }
      });

      // Typing... feature
    this.socket.syncTyping(data => {
      this.typing=data.sender+" "+data.message;
    });

    });
  }

  checkMemberOnline(member) {
    var flag = 0;
    angular.forEach(this.onlineUsers, (ou) => {
      if (ou.name == member.name) {
        flag = 1;
      }
    });

    if (flag === 1) {
      return true;
    } else
      return false;
  }

  addThisEmoji(key, value) {
    /**
     * @param {String} key The text equivalent of the emoji
     * @param {String} value The visual equivalent of the emoji
     */
    key = ':' + key + ':';
    this.message = this.message + ' ' + value + ' ';
  }

  //Toggle var for wall pinned posts
  toggleHide(index) {
    this.chatHistory[index].hide = !this.chatHistory[index].hide;
  }

  /**
  *Show all channels of the team selected
  */
  showChannels(teamInfo){
    this.chShow=true;
    this.selectedTeamInfo = teamInfo;

    //Get the domain of organization from thead domain
    this.domain = (this.selectedTeamInfo.thead[0]).split('@');
    this.domain = this.domain[this.domain.length-1];


    //Get channels which are part of this team
    this.channels = this.selectedTeamInfo.channel;
    var isHead = this.selectedTeamInfo.thead.indexOf(this.user.email);
    if(isHead!=-1){
      this.allowLeaving = false;
    }
    this.filterPrivateChannelByMember();
    this.filterPublicChannel();
  }


  //Filter private Channels, filter private channels of the member
  filterPrivateChannelByMember() {
    this.privateChannels = this.channels.filter((req) => {
      return !(req.name === 'public');
    });

    this.privateChannels = this.privateChannels.filter((req) => {
      return req.members.includes(this.user.email);
    });

    this.connectRooms(this.privateChannels);

  };

  //Filter public channel from the list of all channels of team
  filterPublicChannel() {
    this.publicChannels = this.channels.filter((req) => {
      return req.name === 'public';
    });
    this.connectRooms(this.publicChannels);
  }

  connectRooms(channel) {
    angular.forEach(channel, (ch) => {
      var room;
      console.log(ch);
      room = this.domain + "-" + this.selectedTeamInfo.name + "-" + ch.name;
      this.socket.room(room);
      console.log(room);
    });
  };

  /**
    *   A channel member leaves the channel
    *   @param {String} channel The channel from which user wants to exit
    */

    leaveGroup(channel){
      this.user.email;  // current user email id
      var leave = {
        'team' :this.selectedTeamInfo,
        'channel':channel
      };

      this.TeamLeader.leaveGroup({'email' : this.user.email},
        {leave}).$promise.then((data) => {
        this.$state.go('home');
      });
    }

  //TODO: Refactor code to service
  //Get all walls from the walls db
  getWalls() {
    return this.$http.get('/api/walls').success(function(response) {});
  }

  //Save the chat message to be pinned to the wall
  saveForWall(writer, message) {

    this.pinned = true;
    this.wallPost = {
      title: 'Wall Post',
      description: message,
      author: writer
    }

    this.getWalls().then((response) => {
      //Stores the response,i.e. json array of json object->organization in originalOrganisations array
      this.originalWalls = response.data;
      //call filter by approval Status
      this.filterWalls();
    });
  }

  //add Post to the wall
  addWallPost() {
    var tempPostArr = this.tempWall.posts;
    tempPostArr.unshift(this.wallPost);
    var post = {
      posts: tempPostArr
    };
    this.$http.put('/api/walls/' + this.tempWall._id, post).success(function(response) {
      //

    });
  }

  //Filter private and public walls
  filterWalls() {
    this.originalWalls = this.originalWalls.filter((req) => {
      return req.domain == this.domain;
    });

    if (this.selectedChannel.name == 'public') {
      this.originalWalls = this.originalWalls.filter((req) => {
        return req.name === 'public';
      });
    } else {
      this.originalWalls = this.originalWalls.filter((req) => {
        return req.name == this.selectedTeamInfo.name;
      });

    }
    this.tempWall = this.originalWalls[0];

    this.addWallPost();
    //
  }

  //Called when show Reqests button is clicked from admin.html
  showRequests() {
    this.showReq = true; //sets showReq = true, used for show/hide of req table
  }


  getChatHistory(room) {
    console.log(room);
    return this.$http.get('/api/chats/' + room).then(res => {
      this.chatHistory = res.data.history;
    });
  }

  //Initiate group chat, create room
  groupChat(channelInfo) {
    this.roomTitle = channelInfo.name;
    this.chatHistory = [];
    this.pc = false;
    this.selectedChannel = channelInfo;

    //ChatRoom Name = Organization Domain + Team Name + ChannelName
    this.roomName = this.domain + "-" + this.selectedTeamInfo.name + "-" + channelInfo.name;
    //  this.socket.room(this.roomName);
    this.getChatHistory(this.roomName);
  }

  //Initiate private chat, create private room
  privateChat(ou) {
    this.roomTitle = ou.name;
    this.chatHistory = [];
    //A user can establish privateChat with only one user at a time,
    // i.e participants.length <=2
    this.pc = true;
    if (this.participants.length != 0) {
      this.participants = [];
    }

    //Add both to participants for storing in db
    this.participants.push(ou);
    this.participants.push(this.user);

    //Generate a common room name
    if (ou.name.charAt(0) <= this.user.name.charAt(0)) {
      this.roomName = ou.email + "-" + this.user.email;
    } else {
      this.roomName = this.user.email + "-" + ou.email;
    }
    this.socket.room(this.roomName);
    this.getChatHistory(this.roomName);
  }

  //upload file to server on file select
  upload(file) {
    console.log("inside upload");
    console.log(file);
    this.progressVisible = true;
    this.f = file;

    file.upload = this.Upload.upload({
      url: '/chat/upload',
      data: {
        file: file,
        'username': this.user.name
      }
    }).then((resp) => {
      console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);

      var extn = resp.config.data.file.name.split(".").pop();
      var msg = "<a href='./../../server/uploads/" + file.name + "'><img src ='" + this.getImage(extn, resp.config.data.file.name) + "' alt='img' height='40' width='40'" + file.name + "</a><b>" + file.name + "</b>";
      // this.socket.sendMessage({
      //   'sender': this.user.name,
      //   'message': msg,
      //   'room': this.roomName
      // });
      this.message = msg;
      this.sendMsgToServer();
      this.message = '';

    }, (resp) => {
      console.log('Error status: ' + resp.status);
    }, (evt) => {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      this.f.progress = progressPercentage;
      if (progressPercentage == 100) {

      }
    });
  };

  /**
   * Checks if user is typing
   */
   isTyping(){

     this.socket.checkTyping({
       'sender':this.user.name,
       'message': 'is typing',
       'room' : this.roomName
     });
   }


  sendMessage() {
    this.pinned = false;
    this.progressVisible = false;

    //If the input field is not empty
    if (this.message) {
      //regex for urls
      var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

      //if the message is a url then perform url scrapping
      if (urlRegex.test(this.message)) {
        this.$http.get("https://api.embedly.com/1/extract?url=" + this.message +
          "&key=5a12e99bc47c478193b26e221b296479").then((data, status) => {

          this.message = '<a href="' + data.data.url +
            '" target="_blank"/><blockquote><img src="' +
            data.data.favicon_url + '"/><p>' + data.data.provider_name +
            '</p><span>' + data.data.description + '</span></blockquote></a>';

          this.sendMsgToServer();
          this.message = '';
        });

      } else {
        this.sendMsgToServer();
        console.log('after send msg to server call');
        this.message = '';
      }

    }
  }

  //send a message to the server
  sendMsgToServer() {
    console.log('inside sendMsgToServer');

    //Emit the socket with senderName, message and channelId
    this.socket.sendMessage({
      'sender': this.user.name,
      'message': this.message,
      'room': this.roomName
    });

    //save the messages on server side
    this.$http.post('/api/chats/' + this.roomName, {
        data: {
          'sender': this.user.name,
          'message': this.message,
        }
      })
      .then(response => {

      });
  }


  getImage(extension, fname) {
    var name;
    switch (extension) {
      case 'docx':
        name = 'assets/images/doc.png';
        break;
      case 'xls':
        name = 'assets/images/excel.png';
        break;
      case 'pdf':
        name = 'assets/images/pdf.png';
        break;
      case 'png':
        name = './../../server/uploads/' + fname;
        break;
      case 'jpg':
        name = 'assets/images/image.png';
        break;
      default:
        name = 'assets/images/file.png';
    }
    return name;
  }
}
