'use strict';

angular.module('navBar', []);


angular.module('navBar')
	.factory('navBarService', function LoadingIndicator($rootScope) {
		function clearNavBar() {
			$rootScope.navBar = {
				buttons: []
			};
		}

		// initialize data structure
		clearNavBar();

		$rootScope.$on('$stateChangeStart', function () {
			clearNavBar();
		});

		var config = {
			addButton: function (button) {
				$rootScope.navBar.buttons.push(button);
			},
			clearNavBar: clearNavBar
		};

		return config;
	});


angular.module('navBar')
	.directive('navBar', function () {

		return {
			restrict: 'E',
			replace: true,
			templateUrl: '/views/modules/nav-bar.html',
			scope: true,
			controller: function ($scope, $state) {
				function execute(item) {
					if (_.has(item, 'action')) {
						item.action();
					}
					else if (_.has(item, 'state')) {
						$state.go(item.state);
					}
					else {
						throw new Error('button must either define an action or a state');
					}
				}

				$scope.buttonClick = function (button) {
					execute(button);
				};
			}
		};
	});