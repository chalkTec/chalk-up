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
	.run(function ($window, $rootScope, $state, user, UserApp) {
		$rootScope.$state = $state;

		$window.moment.lang('de');
		$window.moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZZ';

		user.init({ appId: '534e382ac8f18' });

		$rootScope.logout = function() {
			// TODO: replace that by user.logout(function() { $state.transitionTo('start'); });
			// as soon as https://github.com/userapp-io/userapp-angular/pull/2 is merged

			UserApp.User.logout(function() {
				user.reset();
				$rootScope.$broadcast('user.logout');

				$state.transitionTo('start');
			});
		};
	});