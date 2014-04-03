'use strict';

angular.module('chalkUpApp')
	.factory('errorService', function ($modal) {
		return {
			restangularError: function (error) {
				$modal.open({
					templateUrl: '/views/restangularError.html',
					controller: ['$scope', function($scope) {
						$scope.error = error;
					}],
					windowClass: 'large error'
				});
			}
		};
	});


