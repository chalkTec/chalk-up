'use strict';

angular.module('chalkUpApp')
	.directive('routeRating', function ($filter) {

		function title(routeRating, readOnly) {
			if(_.isUndefined(routeRating)) {
				return '';
			}
			if(readOnly) {
				var avg = routeRating.average;
				return avg ? $filter('number')(avg, 1) + ' Sterne' : 'keine Stimmen';
			}
			else {
				return 'stimme ab!';
			}
		}

		return {
			restrict: 'A',
			template: '<rating class="route-rating" value="value" readonly="readonly" on-hover="overStar = value" on-leave="overStar = null" ng-click="rate(overStar)" title="{{mouseOverText}}" state-on="\'fi-star filled\'" state-off="\'fi-star unfilled\'" ng-class="{\'not-rated\': routeRating.count == 0}"></rating>',
			scope: {
				routeRating: '=',
				readonly: '=',
				onRate: '&'
			},
			controller: function ($scope) {
				$scope.$watch('routeRating', function(routeRating) {
					$scope.mouseOverText = title(routeRating, $scope.readonly);

					if(!_.isUndefined(routeRating)) {
						$scope.value = routeRating.average;
					}
					else {
						$scope.value = undefined;
					}
				}, true);


				$scope.$watch('readonly', function(readonly) {
					$scope.mouseOverText = title($scope.routeRating, readonly);

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