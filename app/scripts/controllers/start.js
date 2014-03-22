'use strict';

angular.module('chalkUpApp')
	.controller('StartCtrl', function ($scope, Restangular) {
		$scope.gyms = Restangular.all('gyms').getList().$object;
	});
