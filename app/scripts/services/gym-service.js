'use strict';

angular.module('chalkUpApp')
	.factory('gymService', function (Restangular, loadingIndicator) {
		return {
			loadGym: function (id) {
				var gym = Restangular.one('gyms', id);
				var gymGet = gym.get();
				loadingIndicator.waitFor(gymGet);
				return gymGet;
			},
			loadRoutes: function(gymId) {
				var routesGet = Restangular.one('gyms', gymId).all('routes').getList();
				loadingIndicator.waitFor(routesGet);
				return routesGet;
			}
		};
	});
