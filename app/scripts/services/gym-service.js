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
			loadRoutes: function (gymId) {
				var routesGet = Restangular.one('gyms', gymId).all('routes').getList();
				loadingIndicator.waitFor(routesGet);
				return routesGet;
			},
			newRoute: function(gym, floorPlan) {
				var newRoute = {
					gym: gym,
					location: {
						floorPlan: floorPlan
					}
				};
				var routesPost = Restangular.one('gyms', gym.id).all('routes').post(newRoute);
				loadingIndicator.waitFor(routesPost);
				return routesPost;
			},
			updateRoute: function (route) {
				var routePut = route.put();
				loadingIndicator.waitFor(routePut);
				return routePut;
			},
			archiveRoute: function (route, date) {
				route.end = $window.moment(date).format();
				var routePut = route.put();
				loadingIndicator.waitFor(routePut);
				return routePut;
			},
			deleteRoute: function (route) {
				var routeRemove = route.remove();
				loadingIndicator.waitFor(routeRemove);
				return routeRemove;
			}
		};
	});
