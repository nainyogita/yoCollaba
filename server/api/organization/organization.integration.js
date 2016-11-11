'use strict';

var app = require('../..');
import User from '../user/user.model';
import Organization from '../organization/organization.model';
import Team from '../team/team.model';
import request from 'supertest';

var newOrganization;

var admin,owner;
var tokenAdmin;
var tokenOwner;
var idAdmin, idOrg;

var response;
var orgJSON;

var organization;

describe('Organization API:', function() {

  beforeEach(function(done) {
    return User.remove().then(function() {
      admin = new User({
        provider: 'local',
        name: 'Fake Admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin',
        status: true
      });
      return admin.save().then(function(){
        request(app)
          .post('/auth/local')
          .send({
            email: 'admin@example.com',
            password: 'admin'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            tokenAdmin = res.body.token;
            idAdmin = res.body._id;
            done();
          });
      });
    });
  });


  /**
   * Test the organizations stored in document
   * Must be retrieved as an array
   * @param  {String}       Generic description
   * @param  {Function} function Callback function
   *
   */
  describe('GET /api/organizations', function() {
    var organizations;

    beforeEach(function(done) {
      request(app)
        .get('/api/organizations')
        .set('authorization', `Bearer ${tokenAdmin}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          organizations = res.body;
          done();
        });
    });

    // Test cases begin
    it('should respond with JSON array', function() {
      expect(organizations).to.be.instanceOf(Array);
    });

    // Test cases end

  });

  describe('POST /api/organizations', function() {

    beforeEach(function(done) {
      orgJSON = {
        name: 'New Organization',
        domain: 'gmail.com',
        owner:{
                email:'new@gmail.com',
                name:'newBie'
              },
        approvalStatus:true
      };
      return Organization.remove().then(function() {
        request(app)
          .post('/api/organizations')
          .send(orgJSON)
          .set('authorization', `Bearer ${tokenAdmin}`)
          .expect(200)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
            response = res.body;
            done();
          });
      });
      done();
    });

    it('should respond with NO because it does not exists', function() {
      expect(response.status).to.equal('NO');
    });
  });


  describe('GET /api/organizations/:id', function() {

    beforeEach(function(done) {
      return Organization.findOne({'owner' : orgJSON.owner}).then((data) => {
        request(app)
          .get(`/api/organizations/${data._id}`)
          .set('authorization', `Bearer ${tokenAdmin}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
            organization = data;
            done();
          });
      });
      done();
    });

    afterEach(function() {
      organization = {};
    });

    it('should respond with the requested organization', function() {
      expect(organization.name).to.equal('New Organization');
    });
  });
});

///////////////////////////////////////////////////////////////////////
/////////////             OWNER              //////////////
///////////////////////////////////////////////////////////////////////
describe('Owner API:', function() {

  beforeEach(function(done) {
    return User.remove().then(function() {
      owner = new User({
        provider: 'local',
        email:'new@gmail.com',
        name:'newBie',
        password: 'owner',
        role: 'owner',
        status: true
      });
      return owner.save(function(err,data){
        idOrg = data._id;
      }).then(function(){

            request(app)
              .post('/auth/local')
              .send({
                email: 'new@gmail.com',
                password: 'owner'
              })
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                tokenOwner = res.body.token;
                done();
              });//end()

      });//owner.save()
    });
  });

  /**
   * Test the updation of organisation status change
   * @param  {String}       Generic description
   * @param  {Function} function Callback function
   */
  describe('PUT /api/organizations/:id', function() {

        // Test cases begin
        it('for updating an organization should respond with status 200', function(done) {
          var org = {approvalStatus:true};
          request(app)
            .put('/api/organizations/'+idOrg)
            .set('authorization', `Bearer ${tokenOwner}`)
            .send(org)
            .expect(200)
            .end((err, res) => {
              if(err) {
                return done(err);
              }
            });
              done();
        });
        // Test cases end
      });


  /**
   * Test the organizations stored in document
   * Must be retrieved as an array
   * @param  {String}       Generic description
   * @param  {Function} function Callback function
   *
   */
  describe('GET /api/organizations/:email/getTeam', function() {
    var organizations;

    beforeEach(function(done) {
      request(app)
        .get('/api/organizations/new@gmail.com/getTeam')
        .set('authorization', `Bearer ${tokenOwner}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          organizations = res.body;
          done();
        });
    });

    // Test cases begin

    it('should respond with JSON array', function() {
      expect(organizations).to.be.instanceOf(Object);
    });

    // Test cases end
  });


  /**
   * Test the organizations stored in document
   * Must be retrieved as an array
   * @param  {String}       Generic description
   * @param  {Function} function Callback function
   */
  describe('PUT /api/organizations/:email/createTeam', function() {
    var orgTeam = {'orgTeam':{'teams':{
                      "name": "team1",
                      "info": "some information",
                      "thead": ["dg@gmail.com"]
                    }}};
    // Test cases begin
    it('for creating a team should respond with status 200', function(done) {
      request(app)
        .put('/api/organizations/new@gmail.com/createTeam')
        .set('authorization', `Bearer ${tokenOwner}`)
        .send(orgTeam)
        .expect(204)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
        });
          done();
    });
    // Test cases end
  });


    /**
     * Test the the deletion of team by owner
     * Must return status 200
     * @param  {String}       Generic description
     * @param  {Function} function Callback function
     */
    describe('PUT /api/organizations/:email/deleteTeam', function() {
      var organizations;
      var orgTeam = {'orgTeam':{
        teamName: "team1"
      }};

      // Test cases begin
      it('for deleting a team should respond with status 200', function(done) {
        request(app)
          .put('/api/organizations/new@gmail.com/deleteTeam')
          .set('authorization', `Bearer ${tokenOwner}`)
          .send(orgTeam)
          .expect(204)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
          });
          done();
      });
      // Test cases end
    });

    /**
     * Test the rejection of organisation
     * @param  {String}       Generic description
     * @param  {Function} function Callback function
     */
    describe('DELETE /api/organizations/:id', function() {

          // Test case begin
          it('for Rejecting an organization should respond with status 200', function(done) {
            request(app)
              .put('/api/organizations/'+idOrg)
              .set('authorization', `Bearer ${tokenOwner}`)
              .expect(200)
              .end((err, res) => {
                if(err) {
                  return done(err);
                }
              });
                done();
          });
          // Test case end
        });
});
