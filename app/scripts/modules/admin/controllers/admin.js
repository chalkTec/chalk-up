'use strict';

angular.module('chalkUpAdmin')
	.controller('AdminCtrl', function ($scope, $stateParams) {
		$scope.gymId = $stateParams.id;
	});