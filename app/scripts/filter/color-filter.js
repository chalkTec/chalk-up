'use strict';

angular.module('chalkUpApp')
	.filter('color', function() {
		return function(routes, colors) {
			colors = colors || [];
			var colorNames = _.map(colors, function(color) {
				return color.name;
			});

			var filtered = _.filter(routes, function(route) {
				return _.contains(colorNames, route.color.name);
			});

			return filtered;
		};
	});
