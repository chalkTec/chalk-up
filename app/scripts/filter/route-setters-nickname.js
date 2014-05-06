'use strict';

angular.module('chalkUpApp')
	.filter('routeSettersNickname', function() {
		return function(routeSetters) {
			return _(routeSetters).pluck('nickname').join(', ');
		};
	});
