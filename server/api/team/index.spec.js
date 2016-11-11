'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var teamCtrlStub = {
  index: 'teamCtrl.index',
  show: 'teamCtrl.show',
  create: 'teamCtrl.create',
  upsert: 'teamCtrl.upsert',
  patch: 'teamCtrl.patch',
  destroy: 'teamCtrl.destroy',
  getTeams: 'teamCtrl.getTeams',
  getUserTeams: 'teamCtrl.getUserTeams',
  teamEdit: 'teamCtrl.teamEdit',
  leaveGroup: 'teamCtrl.leaveGroup',
  addTeamMember: 'teamCtrl.addTeamMember'
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
var teamIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './team.controller': teamCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Team API Router:', function() {
  it('should return an express router instance', function() {
    expect(teamIndex).to.equal(routerStub);
  });

  describe('GET /api/teams', function() {
    it('should route to team.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'teamCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/teams/:id', function() {
    it('should route to team.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'teamCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/teams/:email/getTeams', function() {
    it('should route to team.controller.getTeams', function() {
      expect(routerStub.get
        .withArgs('/:email/getTeams', 'authService.isAuthenticated', 'teamCtrl.getTeams')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/teams/:email/getUserTeams', function() {
    it('should route to team.controller.getUserTeams', function() {
      expect(routerStub.get
        .withArgs('/:email/getUserTeams', 'authService.isAuthenticated', 'teamCtrl.getUserTeams')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/teams', function() {
    it('should route to team.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.hasRole.thead', 'teamCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/teams/teamEdit',function(){
    it('should route to team.controller.teamEdit', function(){
      expect(routerStub.post
        .withArgs('/teamEdit','authService.hasRole.thead','teamCtrl.teamEdit')
      ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/teams/:id', function() {
    it('should route to team.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'teamCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/teams/:email/leaveGroup', function() {
    it('should route to team.controller.leaveGroup', function() {
      expect(routerStub.put
        .withArgs('/:email/leaveGroup', 'authService.isAuthenticated', 'teamCtrl.leaveGroup')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/teams/:email/addTeamMember', function() {
    it('should route to team.controller.addTeamMember', function() {
      expect(routerStub.put
        .withArgs('/:email/addTeamMember', 'authService.hasRole.thead', 'teamCtrl.addTeamMember')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/teams/:id', function() {
    it('should route to team.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'teamCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/teams/:id', function() {
    it('should route to team.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'teamCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
