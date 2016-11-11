'use strict';

import * as _ from 'lodash';
import angular from 'angular';
import io from 'socket.io-client';

function Socket(socketFactory) {
  'ngInject';
  // socket.io now auto-configures its connection when we ommit a connection url

  var ioSocket = io('', {
    // Send auth token on connection, you will need to DI the Auth service above
    // 'query': 'token=' + Auth.getToken()
    path: '/socket.io-client'
  });

  var socket = socketFactory({
    ioSocket
  });

  return {
    socket,

    onlineUsers(user) {
      console.log('hiiiiii');
      socket.emit('add:onlineUsers', user);
    },

    syncOnlineUsers(cb) {
      socket.on('add:onlineUsers', function(data) {
        console.log("Get syncOnlineUsers data:");
        console.log(data);
        cb(data);
      });
    },

    //Send room channelId to join
    room(roomName) {
      socket.emit('room', roomName);
    },

    //Send Messahe to channel on
    sendMessage(data) {
      console.log(data);
      socket.emit('room:sendMessage', data);
    },
    /**
         * Checks if the user is typing
         * @param  {Object} data JSON data from chat
         *
         */
        checkTyping(data){
          socket.emit('room:checkTyping',data);
          setTimeout(function(){
            data.message='';
            data.sender='';
            socket.emit('room:checkTyping',data);
          },3000);
        },

        /**
         * Sends it to the HTML
         * @param  {Function} cb Callback function
         */
        syncTyping(cb){
          socket.on('room:checkTyping',function(data){
            cb(data);
          });
        },
    syncUpdateChat(cb) {
      socket.on('room:sendMessage', function(data) {
        console.log("Get info:" + data);
        cb(data);
      });
    },

    logout() {
      socket.emit('logout:disconnect');
    },

    /**
     * Register listeners to sync an array with updates on a model
     *
     * Takes the array we want to sync, the model name that socket updates are sent from,
     * and an optional callback function after new items are updated.
     *
     * @param {String} modelName
     * @param {Array} array
     * @param {Function} cb
     */
    syncUpdates(modelName, array, cb) {
      cb = cb || angular.noop;

      /**
       * Syncs item creation/updates on 'model:save'
       */

      socket.on(`${modelName}:save`, function(item) {
        var oldItem = _.find(array, {
          _id: item._id
        });
        var index = array.indexOf(oldItem);
        var event = 'created';

        // replace oldItem if it exists
        // otherwise just add item to the collection
        if (oldItem) {
          array.splice(index, 1, item);
          event = 'updated';
        } else {
          array.push(item);
        }

        cb(event, item, array);
      });

      /**
       * Syncs removed items on 'model:remove'
       */
      socket.on(`${modelName}:remove`, function(item) {
        var event = 'deleted';
        _.remove(array, {
          _id: item._id
        });
        cb(event, item, array);
      });
    },

    /**
     * Removes listeners for a models updates on the socket
     *
     * @param modelName
     */
    unsyncUpdates(modelName) {
      socket.removeAllListeners(`${modelName}:save`);
      socket.removeAllListeners(`${modelName}:remove`);
    },
  };
}

export default angular.module('gabfestApp.socket', [])
.factory('socket', Socket)
.name;
