'use strict';

angular.module('chalkUpAdmin')
	.controller('AdminCtrl', function ($scope, $stateParams, gymService, routesMapService, routesTableService, errorService) {
		$scope.gymId = $stateParams.id;

		var gymLoad = gymService.loadGym($scope.gymId);
		gymLoad.catch(function () {
			$scope.gymLoadError = true;
		});

		var routesLoad = gymService.loadRoutes($scope.gymId);
		routesLoad.catch(function () {
			$scope.routesLoadError = true;
		});

		gymLoad.then(function (gym) {
			routesMapService.updatePlan(gym.floorPlans[0]);
			$scope.gym = gym;

			routesLoad.then(function (routes) {
				routesMapService.updateRoutes(routes);
				routesTableService.updateRoutes(routes);

				$scope.routes = routes;
			});
		});

		routesMapService.onSelectionChange($scope, function (route) {
			routesTableService.select(route);
			$scope.selected = route;
		});

		routesTableService.onSelectionChange($scope, function (route) {
			routesMapService.select(route);
			$scope.selected = route;
			$scope.editedRoute = _.cloneDeep(route);
		});


		$scope.deleteRoute = function (route) {
			gymService.deleteRoute(route)
				.then(function () {
					_.pull($scope.routes, route);

					routesMapService.updateRoutes($scope.routes);
					routesTableService.updateRoutes($scope.routes);
				})
				.catch(function (error) {
					errorService.restangularError(error);
				});
		};
	});