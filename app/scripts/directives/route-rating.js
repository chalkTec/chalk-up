'use strict';

angular.module('chalkUpApp')
	.directive('routeRating', function () {

		return {
			restrict: 'A',
			template: '<rating class="route-rating" value="value" readonly="readonly" on-hover="overStar = value" on-leave="overStar = null" ng-click="rate(overStar)" title="{{mouseOverText}}" state-on="\'fi-star filled\'" state-off="\'fi-star unfilled\'" ng-class="{\'not-rated\': routeRating.count == 0}"></rating>',
			scope: {
				routeRating: '=',
				readonly: '=',
				onRate: '&'
			},
			controller: function ($scope, $filter) {
				$scope.$watch('routeRating', function(routeRating) {
					if(!_.isUndefined(routeRating)) {
						$scope.value = routeRating.average;
					}
					else {
						$scope.value = undefined;
					}
				}, true);


				$scope.$watch('readonly', function(readonly) {
					if(!readonly) {
						$scope.rate = function(rating) {
							$scope.onRate({rating: rating});
						};
						$scope.mouseOverText = 'stimme ab!';
					}
					else {
						$scope.rate = function() {};
						var avg = $scope.routeRating.average;
						$scope.mouseOverText = avg ? $filter('number')(avg, 1) + ' Sterne' : 'keine Stimmen';
					}
				});
			}
		};
	});