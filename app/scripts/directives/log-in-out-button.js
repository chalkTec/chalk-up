'use strict';

angular.module('chalkUpApp')
	.directive('logInOutButton', function () {

		return {
			restrict: 'A',
			template: '<a ng-click="logout()" ng-show="user.authenticated" title="{{user.login}} abmelden"><i class="fi-power"></i><span class="button-label">Abmelden</span></a>' +
				'<a ng-click="login()" ng-hide="user.authenticated"><i class="fi-arrow-right"></i><span class="button-label">Anmelden</span></a>',
			scope: {},
			controller: function($scope, $rootScope, $state, user, UserApp, loginInterceptor) {
				$scope.user = user.current;

				$scope.login = function() {
					loginInterceptor.stateAfterLogin($state.$current.name, $state.params)
					$state.go('login');
				};

				$scope.logout = function() {
					// TODO: replace that by user.logout(function() { $state.transitionTo('start'); });
					// as soon as https://github.com/userapp-io/userapp-angular/pull/2 is merged

					UserApp.User.logout(function() {
						user.reset();
						$rootScope.$broadcast('user.logout');

						$state.transitionTo('start');
					});
				};
			}
		};
	});


