'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var wallCtrlStub = {
  index: 'wallCtrl.index',
  show: 'wallCtrl.show',
  create: 'wallCtrl.create',
  upsert: 'wallCtrl.upsert',
  patch: 'wallCtrl.patch',
  destroy: 'wallCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var wallIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './wall.controller': wallCtrlStub
});

describe('Wall API Router:', function() {
  it('should return an express router instance', function() {
    expect(wallIndex).to.equal(routerStub);
  });

  describe('GET / ', function() {
    it('should route to wall.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'wallCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET / /:id', function() {
    it('should route to wall.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'wallCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST / ', function() {
    it('should route to wall.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'wallCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT / /:id', function() {
    it('should route to wall.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'wallCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH / /:id', function() {
    it('should route to wall.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'wallCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE / /:id', function() {
    it('should route to wall.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'wallCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
