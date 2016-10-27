'use strict';

var app = require('../..');
import request from 'supertest';

var newChat;

describe('Chat API:', function() {
  describe('GET /api/chats', function() {
    var chats;

    beforeEach(function(done) {
      request(app)
        .get('/api/chats')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          chats = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(chats).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/chats', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/chats')
        .send({
          name: 'New Chat',
          info: 'This is the brand new chat!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newChat = res.body;
          done();
        });
    });

    it('should respond with the newly created chat', function() {
      expect(newChat.name).to.equal('New Chat');
      expect(newChat.info).to.equal('This is the brand new chat!!!');
    });
  });

  describe('GET /api/chats/:id', function() {
    var chat;

    beforeEach(function(done) {
      request(app)
        .get(`/api/chats/${newChat._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          chat = res.body;
          done();
        });
    });

    afterEach(function() {
      chat = {};
    });

    it('should respond with the requested chat', function() {
      expect(chat.name).to.equal('New Chat');
      expect(chat.info).to.equal('This is the brand new chat!!!');
    });
  });

  describe('PUT /api/chats/:id', function() {
    var updatedChat;

    beforeEach(function(done) {
      request(app)
        .put(`/api/chats/${newChat._id}`)
        .send({
          name: 'Updated Chat',
          info: 'This is the updated chat!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedChat = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedChat = {};
    });

    it('should respond with the original chat', function() {
      expect(updatedChat.name).to.equal('New Chat');
      expect(updatedChat.info).to.equal('This is the brand new chat!!!');
    });

    it('should respond with the updated chat on a subsequent GET', function(done) {
      request(app)
        .get(`/api/chats/${newChat._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let chat = res.body;

          expect(chat.name).to.equal('Updated Chat');
          expect(chat.info).to.equal('This is the updated chat!!!');

          done();
        });
    });
  });

  describe('PATCH /api/chats/:id', function() {
    var patchedChat;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/chats/${newChat._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Chat' },
          { op: 'replace', path: '/info', value: 'This is the patched chat!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedChat = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedChat = {};
    });

    it('should respond with the patched chat', function() {
      expect(patchedChat.name).to.equal('Patched Chat');
      expect(patchedChat.info).to.equal('This is the patched chat!!!');
    });
  });

  describe('DELETE /api/chats/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/chats/${newChat._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when chat does not exist', function(done) {
      request(app)
        .delete(`/api/chats/${newChat._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
