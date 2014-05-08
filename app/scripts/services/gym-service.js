'use strict';

angular.module('chalkUpApp')
	.factory('gymService', function (moment, Restangular, loadingIndicator, user) {
		function pad(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		function transformRoute(route) {
			// fix sorting of number
			var numberThanAnything = /(\d*)(.*)/;
			var result = numberThanAnything.exec(route.number);
			route.numberSortable = pad(result[1], 5) + result[2];

			// add 'new' property
			if (moment().diff(moment(route.dateSet), 'days', true) < 60) {
				route.new = true;
			}

			// set average rating of route without ratings to 0 (so that sorting works)
			if(_.isUndefined(route.ratings.average)) {
				route.ratings.average = 0;
			}
		}

		function transformRouteWhenReturned(routePromise) {
			routePromise.then(function(route) {
				transformRoute(route);
			});
		}

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

				routesGet.then(function(routes) {
					_.each(routes, transformRoute);
				});

				return routesGet;
			},
			createRoute: function(gym, route) {
				var routesPost = Restangular.one('gyms', gym.id).all('routes').post(route, undefined, {'X-Auth-Token': user.token()});
				loadingIndicator.waitFor(routesPost);
				transformRouteWhenReturned(routesPost);
				return routesPost;
			},
			updateRoute: function (route) {
				var routePut = route.put(undefined, {'X-Auth-Token': user.token()});
				loadingIndicator.waitFor(routePut);
				transformRouteWhenReturned(routePut);
				return routePut;
			},
			archiveRoute: function (route, date) {
				route.end = moment(date).format();
				var routePut = route.put(undefined, {'X-Auth-Token': user.token()});
				loadingIndicator.waitFor(routePut);
				transformRouteWhenReturned(routePut);
				return routePut;
			},
			deleteRoute: function (route) {
				var routeRemove = route.remove(undefined, {'X-Auth-Token': user.token()});
				loadingIndicator.waitFor(routeRemove);
				transformRouteWhenReturned(routeRemove);
				return routeRemove;
			},
			createRouteSetter: function(gym, routeSetter) {
				var routeSettersPost = Restangular.one('gyms', gym.id).all('routeSetters').post(routeSetter, undefined, {'X-Auth-Token': user.token()});
				loadingIndicator.waitFor(routeSettersPost);
				return routeSettersPost;
			}
		};
	});
