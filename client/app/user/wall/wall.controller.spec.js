'use strict';

describe('Controller: WallCtrl', function() {
  // load the controller's module
  beforeEach(module('yoCollabaApp.wall'));

  var WallCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    WallCtrl = $controller('WallCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
