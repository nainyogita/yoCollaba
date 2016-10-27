/**
 * Socket.io configuration
 */
'use strict';

// import config from './environment';
var onlineUsers = [];
var numOnlineUsers;


// When the user disconnects.. perform this
function onDisconnect(socket,socketio) {
  //send message to the people in channel

  //ISSUE: NOT Working
  //console.log("Data");

  // console.log(numOnlineUsers);
  // console.log(onlineUsers);
  socket.on('remove:onlineUsers', data => {
  // console.log('Socket:id' + socket.id);
  console.log("REMOVE ONLINE USER");
  console.log("Data");
  console.log(data);
  numOnlineUsers--;
  console.log(numOnlineUsers);
  onlineUsers.splice(onlineUsers.indexOf(socket.id), 1);
  socketio.emit('remove:onlineUsers', onlineUsers);
  socket.log(JSON.stringify(data, null, 2));
});

}



// When the user connects.. perform this
function onConnect(socket, socketio) {
  // When the client emits 'info', this listens and executes
  socket.on('info', data => {
    socket.log(JSON.stringify(data, null, 2));
  });

      //send message to the people in channel
      socket.on('add:onlineUsers', data => {
      // console.log('Socket:id' + socket.id);
      console.log("Data");
      console.log(data);

      numOnlineUsers++;
      onlineUsers.push(data);
      console.log(onlineUsers);
      console.log("SocketId-->");
      console.log(socket.id);

      socketio.emit('add:onlineUsers', onlineUsers);
      socket.log(JSON.stringify(data, null, 2));
    });

    //Create rooms for chat
    socket.on('room', data => {
      socket.join(data);
    });

    //send message to the people in channel
    socket.on('room:sendMessage', data => {
      // console.log('Socket:id' + socket.id);
      // console.log("Data:" + data);
      socketio.to(data.room)
        .emit('room:sendMessage', data);
      socket.log(JSON.stringify(data, null, 2));
    });


  // Insert sockets below
  require('../api/emojis/emojis.socket').register(socket);
   require('../api/wall/wall.socket').register(socket);
  require('../api/channel/channel.socket').register(socket);
  require('../api/team/team.socket').register(socket);
  require('../api/chat/chat.socket').register(socket);
  require('../api/organization/organization.socket').register(socket);
  require('../api/thing/thing.socket').register(socket);
}

export default function(socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  // console.log("Socket IO Printing");
  // console.log(socketio);

  socketio.on('connection', function(socket) {
    socket.address = `${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}`;

    socket.connectedAt = new Date();

    socket.log = function(...data) {
      console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
    };

    // Call onDisconnect.
    socket.on('disconnect', () => {
      onDisconnect(socket,socketio);
      socket.log('DISCONNECTED');
    });

    // Call onConnect.
    onConnect(socket,socketio);
    socket.log('CONNECTED');
  });
}
