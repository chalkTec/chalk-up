'use strict';

angular.module('chalkUpApp')
	.filter('grade', function() {
		return function(grade, scale) {
			switch(scale) {
				case 'uiaa':
					return grade.uiaa;
				case 'font':
					return grade.font;
				default:
					throw new Error('scale ' + scale + ' is not supported for this filter');
			}
		};
	});
