'use strict';

angular.module('chalkUpApp')
	.controller('GymCtrl', function ($scope, $stateParams) {

		$scope.gym = { id: $stateParams.id };
	});
