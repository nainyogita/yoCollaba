'use strict';

var app = require('../..');
import User from '../user/user.model';
import Team from '../team/team.model';
import Channel from '../channel/channel.model';
import request from 'supertest';

var newTeam;
var teamleader;
var tokenTeamleader;
var team;
var idTeam;
var teams;
var json;
var channel;
var chooseTeam , chooseChannel;

describe('Team API:', function() {

  beforeEach(function(done) {
    return User.remove().then(function() {
        team = new Team({
          name: 'Modi Mills',
          thead: ['thead@example.com'], //Multiple heads of team
          members: ['priyanka@example.com','thead@example.com'],
          info: 'Modi Mills, Okhla',
        });

        teamleader = new User({
          provider: 'local',
          name: 'Fake TL',
          email: 'thead@example.com',
          password: 'thead',
          role: 'thead',
          status: true
        });

        channel = new Channel({
          name: 'public',
          info : 'A public channel',
          members : [ 'priyanka@example.com','thead@example.com'],
          type : 'public'
        });

        teamleader.team.push(team);
        teamleader.channel.push(channel);


        return teamleader.save().then(function() {
          return channel.save().then(function(){
              team.channel.push(channel);
              return team.save(function(err,data){
                idTeam = data._id;
              }).then(function() {
                chooseTeam = team;
                chooseChannel = channel;
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
                    tokenTeamleader = res.body.token;
                    done();
                  }); //.end()
                //
              }); // team.save.then()
            });// channel.save.then()
        }); // teamleader.save()
    });
  });

  describe('GET /api/teams/:email/getTeams', function() {
    var teams;

    beforeEach(function(done) {
      request(app)
        .get('/api/teams/teamleader@example.com/getTeams')
        .set('authorization', `Bearer ${tokenTeamleader}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          teams = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(teams).to.be.instanceOf(Array);
    });
  });


  describe('POST /api/teams/teamEdit', function() {

      it('should respond with redirect on post', function(done) {

        json = {
          "JSON" : {
                    'id':idTeam,
                    'name':'New Modi Mills',
                    'info':'new info'
                  }
          }

        request(app)
          .post('/api/teams/teamEdit')
          .send(json)
          .set('authorization', `Bearer ${tokenTeamleader}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
          });
          done();
      });
    });


  describe('PUT /api/teams/:email/addTeamMember', function() {
    it('should respond with status 200 when adding a member', function(done) {
      var teamJson ={'team': {
        member: 'papa@gmail.com',
        teamName: 'Modi Mills'
      }};

      request(app)
        .put('/api/teams/thead@example.com/addTeamMember')
        .set('authorization', `Bearer ${tokenTeamleader}`)
        .send(teamJson)
        .expect(200)
        .end((err, res) => {
          if(err) {

            return done(err);
          }
        });
          done();
    });
  });


  describe('PUT /api/teams/:email/leaveGroup', function() {
    it('should respond with status 200 when leaving a group', function(done) {

      var leaveJson ={'leave' : {
        'team' :chooseTeam,
        'channel':chooseChannel
      }};

      request(app)
        .put('/api/teams/thead@example.com/leaveGroup')
        .set('authorization', `Bearer ${tokenTeamleader}`)
        .send(leaveJson)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {

            return done(err);
          }
        });
        done();
    });
  });


}); // describe ends here
