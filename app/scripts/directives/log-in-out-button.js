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
					loginInterceptor.stateAfterLogin($state.$current.name, $state.params);
					$state.go('login');
				};

				$scope.logout = function() {
					user.logout(function() {
						$state.go('start');
					});
				};
			}
		};
	});


