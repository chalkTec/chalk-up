'use strict';

angular.module('chalkUpApp', [
	'ui.router',
	'restangular',
	'angularSpinner',
	'angularMoment',
	'angulartics',
	'angulartics.google.analytics',
	'ngGrid',
	'gymMap',
	'chalkUpAdmin'
]);

angular.module('chalkUpApp')
	.run(function ($window, $rootScope, $state) {
		$rootScope.$state = $state;

		$window.moment.lang('de');
	});