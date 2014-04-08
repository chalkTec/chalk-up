'use strict';

angular.module('navBar', []);

angular.module('navBar')
	.directive('navBar', function () {

		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			templateUrl: '/views/modules/nav-bar.html'
		};
	});