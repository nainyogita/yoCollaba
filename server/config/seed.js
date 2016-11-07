// /**
//  * Populate DB with sample data on server start
//  * to disable, edit config/environment/index.js, and set `seedDB: false`
//  */
//
'use strict';
//import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Organization from '../api/organization/organization.model';
//
//
// Organization.find({}).remove();
//   .then(() => {
//     Organization.create({
//         name: 'ABC Organisation',
//         domain: 'abc.com',
//         approvalStatus: false,
//         owner: {
//           name: 'Owner ABC',
//           email: 'owner@abc.com'
//         },
//         info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, ' +
//           'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, ' +
//           'Stylus, Sass, and Less.',
//
//         teams: [
//           //team A
//           {
//             name: 'Team A',
//             //theads are also counted as total members of team
//             //Only heads can make channels
//             info: 'this team is to create an idea',
//             thead: ['teamA.ka.Ahead@abc.com', 'teamA.ka.Bhead@abc.com', 'farhan@abc.com'],
//             members: ['teamA.ka.Amem@abc.com', 'teamA.ka.Bmember@abc.com'],
//             channels: [{
//               name: 'channel 1',
//               //whichever thead creates the channel is also added to list of participants
//               participants: ['teamA.ka.Ahead@abc.com', 'teamA.ka.Amem@abc.com']
//             }, {
//               name: 'channel 2',
//               participants: ['farhan@abc.com', 'teamA.ka.Amem@abc.com', 'teamA.ka.Bmember@abc.com']
//             }]
//           },
//           //team B
//           {
//             name: 'Team B',
//             //farhan team A or teamB dono m head h
//             info: 'this team is to create an idea',
//             thead: ['teamB.ka.Ahead@abc.com', 'teamB.ka.Bhead@abc.com', 'farhan@abc.com'],
//             //head of team A is a member of team B
//             members: ['teamB.ka.Amem@abc.com', 'teamB.ka.Bmember@abc.com', 'teamA.ka.Ahead@abc.om'],
//             channels: [{
//               name: 'Team B ka 1 channel',
//               participants: ['teamB.ka.Amem@abc.com', 'teamB.ka.Bmember@abc.com', 'teamB.ka.headB@abc.com']
//             }]
//           }
//
//         ]
//       },
//       {
//         name: 'XYZ Organisation',
//         domain: 'xyz.com',
//         approvalStatus: false,
//         owner: {
//           name: 'Owner DEF',
//           email: 'owner@def.com'
//         },
//         info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, ' +
//           'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, ' +
//           'Stylus, Sass, and Less.'
//       }
//     );
//   });
//
//
// Password for role owner: owner
// Password for theads : thead
// Password for admin : admin
// Password for other users : user
//
// User.find({})
//   .then(() => {
//     User.create(
//       // {
//       //   provider: 'local',
//       //   name: 'Test User',
//       //   email: 'test@example.com',
//       //   password: 'test'
//       // },
//       {
//         provider: 'local',
//         role: 'admin',
//         name: 'Admin',
//         email: 'admin@gabfest.com',
//         password: 'admin',
//         status: true
//       });
//   });
User.find({name:'Atul'}).remove()
  .then(() => {
    User.create({

           provider : 'local',
           name : 'Atul',
           email : 'atul@niit-tech.com',
           status : true,
           role : 'thead',
           password:'aaa'
  });
});
//      , {
//         provider: 'local',
//         role: 'owner',
//         name: 'owner ABC',
//         email: 'owner@abc.com',
//         password: 'owner',
//         partOf: {org:'ABC Organisation' ,team:['team A','team B']}
//       }, {
//         provider: 'local',
//         role: 'thead',
//         name: 'team A -->head A',
//         email: 'teamA.ka.Ahead@abc.com',
//         password: 'thead',
//         partOf: {org:'ABC Organisation' ,team:['team A']}
//       }, {
//         provider: 'local',
//         role: 'admin',
//         name: 'team A-->head B',
//         email: 'teamA.ka.Bhead@abc.com',
//         password: 'thead',
//         partOf: {org:'ABC Organisation' ,team:['team A']}
//       }, {
//         provider: 'local',
//         role: 'thead',
//         name: 'Farhan',
//         email: 'farhan@abc.com',
//         password: 'user',
//         partOf: {org:'ABC Organisation' ,team:['team A','team B']}
//       }, {
//         provider: 'local',
//         name: 'MEMBER A-->A',
//         email: 'teamA.ka.Amem@abc.com',
//         password: 'user',
//         partOf: {org:'ABC Organisation' ,team:['team A']}
//       }, {
//         provider: 'local',
//         name: 'MEMBER A-->B',
//         email: 'teamA.ka.Bmember@abc.com',
//         password: 'user',
//         partOf: {org:'ABC Organisation' ,team:['team A']}
//       }, {
//         provider: 'local',
//         role: 'thead',
//         name: 'team B ka B head',
//         email: 'teamB.ka.Ahead@abc.com',
//         password: 'thead',
//         partOf: {org:'ABC Organisation' ,team:['team B']}
//       }, {
//         provider: 'local',
//         role: 'thead',
//         name: 'team B ka B head',
//         email: 'teamB.ka.Bhead@abc.com',
//         password: 'thead',
//         partOf: {org:'ABC Organisation' ,team:['team B']}
//       }, {
//         provider: 'local',
//         name: 'MEMBER B--->A',
//         email: 'teamB.ka.Amem@abc.com',
//         password: 'user',
//         partOf: {org:'ABC Organisation' ,team:['team B']}
//       }, {
//         provider: 'local',
//         name: 'MEMBER B--->B',
//         email: 'teamB.ka.Bmember@abc.com',
//         password: 'user',
//         partOf: {org:'ABC Organisation' ,team:['team B']}
//       })
//       .then(() => {
//
//       });
//   });
