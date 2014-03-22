'use strict';

angular.module('cuColor', []);


angular.module('cuColor')
	.factory('cuColorService', function () {

		function getCss(color, angle) {
			if (_.isUndefined(angle)) {
				angle = 0;
			}

			if (_.isUndefined(color)) {
				return {
					background: ''
				};
			}
			else if (color.hasOwnProperty('ternary')) {
				// use text gradient for two colored boulders
				var tripleGradient = color.primary + ' 33%, ' +
					color.secondary + ' 33%, ' + color.secondary + ' 67%, ' +
					color.ternary + ' 67%';

				return {
					background: 'linear-gradient(' + angle + 'deg, ' + tripleGradient + ')'
				};
			}
			else if (color.hasOwnProperty('secondary')) {
				// use text gradient for two colored boulders
				var doubleGradient = color.primary + ' 50%, ' + color.secondary + ' 50%';

				return {
					background: 'linear-gradient(' + angle + 'deg, ' + doubleGradient + ')'
				};
			}
			else {
				return {
					background: color.primary
				};
			}
		}

		return {
			getCss: getCss
		};
	});


angular.module('cuColor').directive('cuColor', function (cuColorService) {
	function colorElem(elem, color, angle) {
		var css = cuColorService.getCss(color, angle);
		$(elem).css(css);
	}

	return {
		restrict: 'A',
		scope: {
			cuColor: '='
		},
		link: function ($scope, elem, attrs) {
			$scope.$watch('cuColor', function (color) {

				if (!_.isUndefined(attrs.angle)) {
					colorElem(elem, color, parseInt(attrs.angle));
				}
				else {
					colorElem(elem, color);
				}
			});
		}
	};
});