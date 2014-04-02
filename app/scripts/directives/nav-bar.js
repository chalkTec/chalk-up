'use strict';

angular.module('chalkUpApp')
	.directive('navBar', function () {

		return {
			restrict: 'E',
			replace: true,
			templateUrl: '/views/nav-bar.html',
			scope: true,
			controller: function ($scope, $state) {
				$scope.menuVisible = false;

				$scope.menu = {
					open: function () {
						$scope.menuVisible = true;
					},
					close: function () {
						$scope.menuVisible = false;
					},
					toggle: function () {
						$scope.menuVisible = !$scope.menuVisible;
					}
				};

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

				$scope.menuItemClick = function (item) {
					execute(item);
					$scope.menu.close();
				};

				$scope.buttonClick = function (button) {
					execute(button);
				};
			},
			link: function (scope) {
				scope.$on('cu-navBar:closeMenu', function () {
					scope.menu.close();
				});
			}
		};
	});