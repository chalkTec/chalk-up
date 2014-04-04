'use strict';

angular.module('chalkUpAdmin')
	.controller('AdminCtrl', function ($scope, $stateParams, $modal, gymService, routesMapService, routesTableService, errorService) {
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
		});

		$scope.editRoute = function (route) {
			var outerScope = $scope;
			var editModal = $modal.open({
				templateUrl: '/views/modules/admin/edit-route.html',
				windowClass: 'small edit',
				controller: ['$scope', function ($scope) {
					$scope.gym = outerScope.gym;
					$scope.route = route.clone();
					$scope.route.dateSetDate = moment($scope.route.dateSet).toDate();

					$scope.save = function (route) {
						route.dateSet = moment(route.dateSetDate).format();
						delete route.dateSetDate;
						$scope.$close(route);
					};
					$scope.discard = function () {
						$scope.$dismiss();
					};
				}]
			});

			editModal.result.then(function (editedRoute) {
				gymService.updateRoute(editedRoute)
					.then(function (updatedRoute) {
						var oldRoute = _.find($scope.routes, function (route) {
							return route.id === updatedRoute.id;
						});
						_.assign(oldRoute, updatedRoute);
					})
					.catch(function (error) {
						errorService.restangularError(error);
					});
			});
			editModal.result.catch(function () {
				// nothing to do, we just do not merge the route
			});
		};

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