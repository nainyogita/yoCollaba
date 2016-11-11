'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var emojisCtrlStub = {
  index: 'emojisCtrl.index',
  show: 'emojisCtrl.show',
  create: 'emojisCtrl.create',
  upsert: 'emojisCtrl.upsert',
  patch: 'emojisCtrl.patch',
  destroy: 'emojisCtrl.destroy'
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
var emojisIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './emojis.controller': emojisCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Emojis API Router:', function() {
  it('should return an express router instance', function() {
    expect(emojisIndex).to.equal(routerStub);
  });

  describe('GET /api/emojiss', function() {
    it('should route to emojis.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'emojisCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  // describe('GET /api/emojiss/:id', function() {
  //   it('should route to emojis.controller.show', function() {
  //     expect(routerStub.get
  //       .withArgs('/:id', 'emojisCtrl.show')
  //       ).to.have.been.calledOnce;
  //   });
  // });
  //
  // describe('POST /api/emojiss', function() {
  //   it('should route to emojis.controller.create', function() {
  //     expect(routerStub.post
  //       .withArgs('/', 'emojisCtrl.create')
  //       ).to.have.been.calledOnce;
  //   });
  // });
  //
  // describe('PUT /api/emojiss/:id', function() {
  //   it('should route to emojis.controller.upsert', function() {
  //     expect(routerStub.put
  //       .withArgs('/:id', 'emojisCtrl.upsert')
  //       ).to.have.been.calledOnce;
  //   });
  // });
  //
  // describe('PATCH /api/emojiss/:id', function() {
  //   it('should route to emojis.controller.patch', function() {
  //     expect(routerStub.patch
  //       .withArgs('/:id', 'emojisCtrl.patch')
  //       ).to.have.been.calledOnce;
  //   });
  // });
  //
  // describe('DELETE /api/emojiss/:id', function() {
  //   it('should route to emojis.controller.destroy', function() {
  //     expect(routerStub.delete
  //       .withArgs('/:id', 'emojisCtrl.destroy')
  //       ).to.have.been.calledOnce;
  //   });
  // });
});
