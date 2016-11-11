/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

//Populate databases with sample data
// if(config.seedDB) {
//   require('./config/seed');
// }

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);
var nodemailer = require('nodemailer');

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {

  });
}

setImmediate(startServer);

//EMAIL

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yogita.uc@gmail.com',    // your email here
    pass: 'urbanclap'          // your password here
  }
});
//var transporter = nodemailer.createTransport('smtps://yogita.uc@gmail.com:urbanclap@smtp.gmail.com');


app.post('/email',function(req,res){
  /**
   * req.body.data captures the JSON named postData
   * in the admin.controller.js file of client end
   */
   var owner = req.body;
   var filePath = path.join(__dirname, '/views/mail.html');
   fs.readFile(filePath, 'utf-8', (error, data) => {
     /**
     * Read the sample file that serves as a skeleton for the mail
     */

     var keys = Object.keys(owner);
     keys.forEach(function(key){
       data = data.replace(new RegExp('owner.' + key, "g"), owner[key]);
     });

     var mailFrom = 'yogita.uc@gmail.com'
     var mailOptions = {
       to: owner.email,                  // your email here
       subject: 'Registeration with gabfest',
       from: mailFrom,
       sender: mailFrom,
       html: data
     };

    transporter.sendMail(mailOptions, function(err, info){
      if (err) {

      }else{

        return res.json(201, info);
      }
    });

  });
});



// Requires controller
var UploadController = require('./uploads/upload.controller');
app.post('/chat/upload', UploadController.uploadFile);

// Expose app
exports = module.exports = app;
