var nodemailer = require('nodemailer');
import fs from 'fs';
import path from 'path';

/**
*   To send an email to the given users
*/
function email(owner){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yogita.uc@gmail.com',    // your email here
      pass: 'urbanclap'          // your password here
    }
  });

  /**
   * @param {JSON} owner captures the JSON named postData
   * in the admin.controller.js file of client end
   */

   var filePath = path.join(__dirname, '../../views/mail.html');
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

      }
    });

  });

}

  module.exports = email;
