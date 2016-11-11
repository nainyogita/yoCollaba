'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var organizationCtrlStub = {
  index: 'organizationCtrl.index',
  show: 'organizationCtrl.show',
  create: 'organizationCtrl.create',
  upsert: 'organizationCtrl.upsert',
  patch: 'organizationCtrl.patch',
  destroy: 'organizationCtrl.destroy',
  createTeam: 'organizationCtrl.createTeam',
  deleteTeam: 'organizationCtrl.deleteTeam',
  owner: 'organizationCtrl.owner'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return `authService.hasRole.${role}`;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()

};

// require the index with our stubbed out modules
var organizationIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './organization.controller': organizationCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Organization API Router:', function() {
  it('should return an express router instance', function() {
    expect(organizationIndex).to.equal(routerStub);
  });

  describe('GET /api/organizations', function() {
    it('should route to organization.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'organizationCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id', function() {
    it('should route to organization.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'organizationCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/organizations', function() {
    it('should route to organization.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'organizationCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/organizations/:id', function() {
    it('should route to organization.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'organizationCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/organizations/:id', function() {
    it('should route to organization.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'organizationCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/organizations/:id', function() {
    it('should route to organization.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'organizationCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/organizations/:email/createTeam', function() {
    it('should route to organization.controller.createTeam', function() {
      expect(routerStub.put
        .withArgs('/:email/createTeam', 'authService.hasRole.owner', 'organizationCtrl.createTeam')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/organizations/:email/deleteTeam', function() {
    it('should route to organization.controller.deleteTeam', function() {
      expect(routerStub.put
        .withArgs('/:email/deleteTeam','authService.hasRole.owner', 'organizationCtrl.deleteTeam')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:email/getTeam', function() {
    it('should route to organization.controller.owner', function() {
      expect(routerStub.get
        .withArgs('/:email/getTeam', 'authService.isAuthenticated', 'organizationCtrl.owner')
        ).to.have.been.calledOnce;
    });
  });

});
