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
	.factory('moment', function ($window) {
		return $window.moment;
	});

angular.module('chalkUpApp')
	.run(function ($rootScope, moment, $state, apiEndpoint, user, loginInterceptor) {
		$rootScope.$state = $state;

		moment.lang('de');
		moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZZ';

		$rootScope.apiEndpoint = apiEndpoint;

		user.init({ appId: '534e382ac8f18' });
		user.onAccessDenied(function (user, event) {
			event.preventDefault();
			$state.transitionTo('accessDenied');
		});
		user.onAuthenticationRequired(function (event, toState, params) {
			event.preventDefault();
			loginInterceptor.stateAfterLogin(toState.name, params);
			$state.go('login');
		});
		$rootScope.$on('user.login', function() {
			loginInterceptor.go();
		});
	});