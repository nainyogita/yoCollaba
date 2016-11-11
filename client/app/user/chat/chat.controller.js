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
  receiver = '';
  chatHistory = [];
  unreadMsg = [];
  emojiList;
  TeamLeader;
  allowLeaving;
  typing;
  showEmoji;
  date = '';

  /*@ngInject*/
  constructor(Auth, $state, socket, Upload, $http, $scope, Notification, Emoji, TeamLeader, $filter) {

    this.socket = socket;
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.messagegreet = 'Chat ChatController';
    this.Upload = Upload;
    this.chShow = false;
    this.progressVisible = false;
    this.$scope = $scope;
    this.pc = false;
    this.Notification = Notification;
    this.pinned = false;
    this.TeamLeader = TeamLeader;
    this.allowLeaving = true;
    this.typing = '';
    this.date = '';
    this.$filter = $filter;
    this.showEmoji = false;

    this.team = $scope.$parent.vmHome.selectedTeamInfo;
    this.tm = $scope.$parent.vmHome.tm;
    //  console.log('team members');
    console.log(this.tm);
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
        angular.forEach(this.onlineUsers, (ou) => {
          //Connect to rooms for all online users
          this.socket.room(this.createRoomName(ou));
        });
      });

      this.socket.syncUpdateChat(data => {
        console.log(data);
        console.log(this.roomName);

        //If the chat window is open , dont send Notification
        //Send notifications for other rooms
        if (data.room != this.roomName) {

          this.Notification.primary('New message from' + data.sender.name);

          var i1 = this.$scope.$parent.vmHome.tm.findIndex(obj => obj.email == data.sender.email);
          console.log(this.$scope.$parent.vmHome.tm[i1]);
          var i2 = this.$scope.$parent.vmHome.tm[i1].unreadMsg.findIndex(obj => obj.participant == this.user.email);
          console.log(i2);
          console.log(this.$scope.$parent.vmHome.tm[i1].unreadMsg[i2]);
          this.$scope.$parent.vmHome.tm[i1].unreadMsg[i2].num += 1;

        } else {

          this.chatHistory.push({
            sender: data.sender.name,
            message: data.message,
            timestamp: new Date()
          });
        }
      });

      // Typing... feature
      this.socket.syncTyping(data => {
        if (data.room == this.roomName) {
          if (data.sender == this.user.name)
            this.typing = "";
          else
            this.typing = data.sender + " " + data.message;
        }
      });

    });
  }

  dateChanged(chatdate) {
    chatdate = this.$filter('date')(chatdate, "dd/MM/yyyy");
    // console.log(chatdate);
    // console.log(this.date);
    // console.log('date ');
    if (chatdate != this.date) {
      //  console.log('date not same');
      this.date = chatdate;
      return true;
    }
    if (chatdate == this.date) {
      //  console.log("date same");
      return false;
    }
  }
  postUnreadMessage(room) {

    var i1 = this.$scope.$parent.vmHome.tm.findIndex(obj => obj.email == this.receiver);
    console.log(this.$scope.$parent.vmHome.tm[i1]);
    var i2 = this.$scope.$parent.vmHome.tm[i1].unreadMsg.findIndex(obj => obj.participant == this.receiver);
    console.log(i2);

    var um = this.$scope.$parent.vmHome.tm[i1].unreadMsg[i2].num + 1;

    var i3 = this.$scope.$parent.vmHome.tm[i1].unreadMsg.findIndex(obj => obj.participant == this.user.email);
    this.$scope.$parent.vmHome.tm[i1].unreadMsg[i3].num = 0;

    console.log('----------postUnreadMessage');
    var unreadMsg = [];

    unreadMsg.push({
      'participant': this.user.email,
      'num': 0
    });

    //For messages to self distinction
    if (this.user.email != this.receiver) {
      unreadMsg.push({
        'participant': this.receiver,
        'num': um
      });
    }
    console.log(unreadMsg);
    this.$http.put('/api/chats/' + room, {
      'unreadMsg': unreadMsg
    }).then(res => {
      console.log(res);
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

  checkMemberOnline(member) {
    // console.log('check member online-------------');
    // console.log(member);

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

  //Show all channels of the team selected
  showChannels(teamInfo) {
    this.chShow = true;
    this.selectedTeamInfo = teamInfo;

    //Get the domain of organization from thead domain
    this.domain = (this.selectedTeamInfo.thead[0]).split('@');
    this.domain = this.domain[this.domain.length - 1];

    //Get channels which are part of this team
    this.channels = this.selectedTeamInfo.channel;
    var isHead = this.selectedTeamInfo.thead.indexOf(this.user.email);
    if (isHead != -1) {
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

  leaveGroup(channel) {
    this.user.email; // current user email id
    var leave = {
      'team': this.selectedTeamInfo,
      'channel': channel
    };

    this.TeamLeader.leaveGroup({
      'email': this.user.email
    }, {
      leave
    }).$promise.then((data) => {
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
    this.receiver = [];
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
    console.log(ou);
    this.participants = [];
    this.roomTitle = ou.name;

    this.chatHistory = [];
    //A user can establish privateChat with only one user at a time,
    // i.e participants.length <=2
    this.pc = true;
    this.receiver = ou.email;


    //Add both to participants for storing in db
    this.participants.push(ou.email);
    this.participants.push(this.user.email);


    //console.log(this.participants.length);
    //console.log(this.participants);
    // if (this.participants.length > 0 && this.participants.length <=2 ) {
    //   this.participants = [];
    // }


    //Generate a common room name
    if (ou.name.charAt(0) < this.user.name.charAt(0)) {
      this.roomName = ou.email + "-" + this.user.email;
    } else {
      this.roomName = this.user.email + "-" + ou.email;
    }
    this.socket.room(this.roomName);
    this.getChatHistory(this.roomName);
    this.postUnreadMessage(this.roomName);
    //  this.um = 0;
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
  isTyping() {

    this.socket.checkTyping({
      'sender': this.user.name,
      'message': 'is typing',
      'room': this.roomName
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
        this.message = '';
      }

    }
  }

  //send a message to the server
  sendMsgToServer() {
    var unreadMsg = [];
    console.log('inside sendMsgToServer');
    console.log(this.participants);

    //Emit the socket with senderName, message and channelId
    this.socket.sendMessage({
      'sender': this.user,
      'message': this.message,
      'room': this.roomName
    });

    angular.forEach(this.participants, (email) => {
      unreadMsg.push({
        'participant': email,
        'num': 0
      });
    });
    console.log(unreadMsg);
    //save the messages on server side
    this.$http.post('/api/chats/' + this.roomName, {
        data: {
          'sender': this.user.name,
          'message': this.message
        },
        unread: {
          'details': unreadMsg
        }

      })
      .then(response => {

      });
    this.postUnreadMessage(this.roomName);
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
