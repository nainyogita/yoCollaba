'use strict';

var app = require('../..');
import User from '../user/user.model';
import Channel from './channel.model';
import Team from '../team/team.model';
import request from 'supertest';

var newChannel;

// User information variables
var token;
var teamleader;
var team;
var channel;
var teamId;

describe('Channel API:', function() {

  // Make a teamleader first
  before(function(done) {
    return User.remove().then(function() {
      return Team.remove().then(function() {
        team = new Team({
         name: 'South Delhi',
         thead: ['thead@example.com'],
         members: ['priyanka@example.com','thead@example.com'],
         info: 'All about our South Delhi',
       });
       teamleader = new User({
         provider: 'local',
         name: 'Fake TL',
         email: 'thead@example.com',
         password: 'thead',
         role: 'thead',
         status: true
       });
       teamleader.team.push(team);
       return teamleader.save().then(function() {
         return team.save(function(err, data){
           teamId = data._id;
         }).then(function() {
           //
          request(app)
            .post('/auth/local')
            .send({
              email : 'thead@example.com',
              password : 'thead'
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              token = res.body.token;
              done();
            });
          //
         });
       });
      });
    });
  });

  // Create a channel first
  describe('POST /api/channels/addChannel', function() {

    it('should respond with the newly created channel', function(done) {
      request(app)
        .post('/api/channels')
        .send({
          "teamId" : teamId,
          "JSON" : {
            name : 'Modi Mills',
            info : 'Modi Mills, Okhla',
            members : [ 'prinka@example.com' ],
            type : 'public'
          }
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
        });
        done();
    });
  });

  describe('GET /api/channels', function() {
    var channels;

    beforeEach(function(done) {
      request(app)
        .get('/api/channels')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          channels = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(channels).to.be.instanceOf(Array);
    });

    it('should have the team JSON saved here', function() {
      let isThere = false;
      for( let idx = 0; idx < channels.length; idx++ ) {
        if( channels[idx]['name'] === 'Modi Mills') {
          isThere = true;
          break;
        }
      }
      expect(isThere).to.be.equal(true);
    })
  });

  describe('POST /api/channels/updateChannel', function() {

    it('should update the existing channel named Modi Mills', function(done) {
      request(app)
        .put('/api/channels/updateChannel')
        .send({
          "name": "Modi Mills",
          "blob" : {
            "name" : "TCIL Greater Kailash",
            "info" : "New Building shifter to TCIL GK 48",
            "members" : ["pratikshya@example.com"]
          }
        })
        .expect(200)
        .end((err, res) => {
          done();
        });
    });

  });
});
