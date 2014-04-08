'use strict';

angular.module('chalkUpApp', [
	'ui.router',
	'restangular',
	'angularSpinner',
	'angularMoment',
	'mm.foundation',
	'angulartics',
	'angulartics.google.analytics',
	'ngCsv',
	'routesMap',
	'routesTable',
	'navBar',
	'chalkUpAdmin'
]);

angular.module('chalkUpApp')
	.run(function ($window, $rootScope, $state) {
		$rootScope.$state = $state;

		$window.moment.lang('de');
		$window.moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZZ';
	});