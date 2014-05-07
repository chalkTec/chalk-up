'use strict';

angular.module('chalkUpApp')
	.service('loadingIndicator', function ($rootScope) {
		var waitQueue = [];

		function removeFromQueue(promise) {
			// remove this promise
			var index = waitQueue.indexOf(promise);
			waitQueue.splice(index, 1);
			if (_.isEmpty(waitQueue)) {
				$rootScope.loading = false;
			}
		}

		this.waitFor = function (promise) {
			$rootScope.loading = true;

			waitQueue.push(promise);
			promise
				.finally(function () {
					removeFromQueue(promise);
				});
		};
	});
