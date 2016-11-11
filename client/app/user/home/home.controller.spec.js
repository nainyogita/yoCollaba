'use strict';

describe('Controller: HomeCtrl', function() {
  // load the controller's module
  beforeEach(module('gabfestApp.home'));

  var HomeCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    HomeCtrl = $controller('HomeCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
