'use strict';

var app = require('../..');
import request from 'supertest';

var newWall;

describe('Wall API:', function() {
  describe('GET / ', function() {
    var walls;

    beforeEach(function(done) {
      request(app)
        .get('/ ')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          walls = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(walls).to.be.instanceOf(Array);
    });
  });

  describe('POST / ', function() {
    beforeEach(function(done) {
      request(app)
        .post('/ ')
        .send({
          name: 'New Wall',
          info: 'This is the brand new wall!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newWall = res.body;
          done();
        });
    });

    it('should respond with the newly created wall', function() {
      expect(newWall.name).to.equal('New Wall');
      expect(newWall.info).to.equal('This is the brand new wall!!!');
    });
  });

  describe('GET / /:id', function() {
    var wall;

    beforeEach(function(done) {
      request(app)
        .get(`/ /${newWall._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          wall = res.body;
          done();
        });
    });

    afterEach(function() {
      wall = {};
    });

    it('should respond with the requested wall', function() {
      expect(wall.name).to.equal('New Wall');
      expect(wall.info).to.equal('This is the brand new wall!!!');
    });
  });

  describe('PUT / /:id', function() {
    var updatedWall;

    beforeEach(function(done) {
      request(app)
        .put(`/ /${newWall._id}`)
        .send({
          name: 'Updated Wall',
          info: 'This is the updated wall!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedWall = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedWall = {};
    });

    it('should respond with the original wall', function() {
      expect(updatedWall.name).to.equal('New Wall');
      expect(updatedWall.info).to.equal('This is the brand new wall!!!');
    });

    it('should respond with the updated wall on a subsequent GET', function(done) {
      request(app)
        .get(`/ /${newWall._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let wall = res.body;

          expect(wall.name).to.equal('Updated Wall');
          expect(wall.info).to.equal('This is the updated wall!!!');

          done();
        });
    });
  });

  describe('PATCH / /:id', function() {
    var patchedWall;

    beforeEach(function(done) {
      request(app)
        .patch(`/ /${newWall._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Wall' },
          { op: 'replace', path: '/info', value: 'This is the patched wall!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedWall = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedWall = {};
    });

    it('should respond with the patched wall', function() {
      expect(patchedWall.name).to.equal('Patched Wall');
      expect(patchedWall.info).to.equal('This is the patched wall!!!');
    });
  });

  describe('DELETE / /:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/ /${newWall._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when wall does not exist', function(done) {
      request(app)
        .delete(`/ /${newWall._id}`)
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
