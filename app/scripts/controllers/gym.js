'use strict';

angular.module('chalkUpApp')
	.controller('GymCtrl', function ($scope, $stateParams) {
		$scope.gymId = $stateParams.id;
	});