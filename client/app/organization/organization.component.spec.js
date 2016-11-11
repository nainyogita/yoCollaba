'use strict';

describe('Component: OrganizationComponent', function() {
  // load the controller's module
  beforeEach(module('gabfestApp.organization'));

  var OrganizationComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    OrganizationComponent = $componentController('organization', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
