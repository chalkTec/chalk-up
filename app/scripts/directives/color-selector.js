'use strict';

angular.module('chalkUpApp')
	.directive('colorSelector', function () {

		return {
			restrict: 'A',
			template: '<select ng-model="selected" ng-options="color as color.germanName for color in colors"></select>',
			scope: {
				colors: '=',
				selected: '='
			},
			controller: function($scope) {
				$scope.selected = _.find($scope.colors, function(color) {
					return color.name === $scope.selected.name;
				});
			}
		};
	});