'use strict';

describe('Controller: GymCtrl', function () {

	// load the controller's module
	beforeEach(module('chalkUpApp'));

	var GymCtrl,
		scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		GymCtrl = $controller('GymCtrl', {
			$scope: scope
		});
	}));

	it('should attach a gym to the scope', function () {
	});
});
