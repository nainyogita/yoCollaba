'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var token;
var user;
var emojis;

describe('Emojis API:', function() {

  beforeEach(function(done) {
    return User.remove().then(function() {
      user = new User({
        provider: 'local',
        name: 'Fake User',
        email: 'user@example.com',
        password: 'user',
        status: true
      });
      return user.save().then(function(){
        request(app)
          .post('/auth/local')
          .send({
            email: 'user@example.com',
            password: 'user'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });
    });
  });

  describe('GET /api/emojiss', function() {
    beforeEach(function(done){
      // Begin of emoji retrieve
      request(app)
        .get('/api/emojiss')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emojis = res.body;
          done();
        });
      // End of emoji retrieve
    });

    it('should respond with JSON array', function() {
      expect(emojis).to.be.instanceOf(Object);
    });

    it('should have atleast one element', function() {
      expect(Object.keys(emojis).length).to.be.at.least(1);
    });
  });
});
