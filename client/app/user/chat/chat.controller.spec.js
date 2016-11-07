'use strict';

describe('Controller: ChatCtrl', function() {
  // load the controller's module
  beforeEach(module('gabfestApp.chat'));

  var ChatCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    ChatCtrl = $controller('ChatCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
