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
	'UserApp',
	'routesMap',
	'routesTable',
	'navBar',
	'chalkUpAdmin'
]);

angular.module('chalkUpApp')
	.run(function ($window, $rootScope, $state, user) {
		$rootScope.$state = $state;

		$window.moment.lang('de');
		$window.moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZZ';

		user.init({ appId: '534e382ac8f18' });
	});