'use strict';

var app = require('../..');
import request from 'supertest';

var newEmojis;

describe('Emojis API:', function() {
  describe('GET /api/emojiss', function() {
    var emojiss;

    beforeEach(function(done) {
      request(app)
        .get('/api/emojiss')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emojiss = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(emojiss).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/emojiss', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/emojiss')
        .send({
          name: 'New Emojis',
          info: 'This is the brand new emojis!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newEmojis = res.body;
          done();
        });
    });

    it('should respond with the newly created emojis', function() {
      expect(newEmojis.name).to.equal('New Emojis');
      expect(newEmojis.info).to.equal('This is the brand new emojis!!!');
    });
  });

  describe('GET /api/emojiss/:id', function() {
    var emojis;

    beforeEach(function(done) {
      request(app)
        .get(`/api/emojiss/${newEmojis._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          emojis = res.body;
          done();
        });
    });

    afterEach(function() {
      emojis = {};
    });

    it('should respond with the requested emojis', function() {
      expect(emojis.name).to.equal('New Emojis');
      expect(emojis.info).to.equal('This is the brand new emojis!!!');
    });
  });

  describe('PUT /api/emojiss/:id', function() {
    var updatedEmojis;

    beforeEach(function(done) {
      request(app)
        .put(`/api/emojiss/${newEmojis._id}`)
        .send({
          name: 'Updated Emojis',
          info: 'This is the updated emojis!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedEmojis = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEmojis = {};
    });

    it('should respond with the original emojis', function() {
      expect(updatedEmojis.name).to.equal('New Emojis');
      expect(updatedEmojis.info).to.equal('This is the brand new emojis!!!');
    });

    it('should respond with the updated emojis on a subsequent GET', function(done) {
      request(app)
        .get(`/api/emojiss/${newEmojis._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let emojis = res.body;

          expect(emojis.name).to.equal('Updated Emojis');
          expect(emojis.info).to.equal('This is the updated emojis!!!');

          done();
        });
    });
  });

  describe('PATCH /api/emojiss/:id', function() {
    var patchedEmojis;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/emojiss/${newEmojis._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Emojis' },
          { op: 'replace', path: '/info', value: 'This is the patched emojis!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedEmojis = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedEmojis = {};
    });

    it('should respond with the patched emojis', function() {
      expect(patchedEmojis.name).to.equal('Patched Emojis');
      expect(patchedEmojis.info).to.equal('This is the patched emojis!!!');
    });
  });

  describe('DELETE /api/emojiss/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/emojiss/${newEmojis._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when emojis does not exist', function(done) {
      request(app)
        .delete(`/api/emojiss/${newEmojis._id}`)
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
