'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var chatCtrlStub = {
  index: 'chatCtrl.index',
  show: 'chatCtrl.show',
  create: 'chatCtrl.create',
  upsert: 'chatCtrl.upsert',
  patch: 'chatCtrl.patch',
  destroy: 'chatCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var chatIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './chat.controller': chatCtrlStub
});

describe('Chat API Router:', function() {
  it('should return an express router instance', function() {
    expect(chatIndex).to.equal(routerStub);
  });

  describe('GET /api/chats', function() {
    it('should route to chat.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'chatCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/chats/:id', function() {
    it('should route to chat.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'chatCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/chats', function() {
    it('should route to chat.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'chatCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/chats/:id', function() {
    it('should route to chat.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'chatCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/chats/:id', function() {
    it('should route to chat.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'chatCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/chats/:id', function() {
    it('should route to chat.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'chatCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
