'use strict';

angular.module('chalkUpApp')
	.directive('routeRating', function () {

		return {
			restrict: 'A',
			template: '<rating class="route-rating" value="routeRating.average" readonly="\'true\'" title="{{routeRating.count}} Stimmen" state-on="\'fi-star filled\'" state-off="\'fi-star unfilled\'" ng-class="{\'not-rated\': routeRating.count == 0}"></rating>',
			scope: {
				routeRating: '='
			},
			controller: function ($scope, $modal) {
			}
		};
	});