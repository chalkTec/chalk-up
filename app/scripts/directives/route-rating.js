'use strict';

angular.module('chalkUpApp')
	.directive('routeRating', function () {

		return {
			restrict: 'A',
			template: '<rating class="route-rating" value="value" readonly="readonly" on-hover="overStar = value" on-leave="overStar = null" ng-click="rate(overStar)" title="{{routeRating.count}} Stimmen" state-on="\'fi-star filled\'" state-off="\'fi-star unfilled\'" ng-class="{\'not-rated\': routeRating.count == 0}"></rating>',
			scope: {
				routeRating: '=',
				readonly: '=',
				onRate: '&'
			},
			controller: function ($scope) {
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
					}
					else {
						$scope.rate = function() {};
					}
				});
			}
		};
	});