'use strict';

angular.module('chalkUpApp', [
	'ui.router',
	'restangular',
	'angularSpinner',
	'angularMoment',
	'mm.foundation',
	'ngCsv',
	'UserApp',
	'routesMap',
	'routesTable',
	'tracking',
	'navBar',
	'angular-flot',
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
		user.onAccessDenied(function () {
			$state.transitionTo('accessDenied');
		});
		user.onAuthenticationRequired(function (toState, params) {
			loginInterceptor.stateAfterLogin(toState.name, params);
			$state.go('login');
		});
		user.onAuthenticationSuccess(function() {
			// prevent redirecting to default route after login
			return false;
		});
	});