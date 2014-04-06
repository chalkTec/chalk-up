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
			$scope.floorPlan = gym.floorPlans[0];

			routesMapService.updatePlan($scope.floorPlan);
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


		var openEditModal = function (route, gym) {
			return $modal.open({
				templateUrl: '/views/modules/admin/edit-route.html',
				windowClass: 'small edit',
				controller: ['$scope', function ($scope) {
					$scope.gym = gym;
					$scope.route = route;
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
		};


		$scope.newRoute = function (gym, floorPlan) {
			var newRoute = {
				type: 'sport-route',
				gym: gym,
				location: {
					floorPlan: floorPlan,
					x: 0,
					y: 0
				},
				color: {
					name: 'RED'
				},
				initialGrade: {
					uiaa: '12'
				}
			};
			var editModal = openEditModal(newRoute, gym);

			editModal.result.then(function (editedRoute) {
				gymService.createRoute(gym, editedRoute)
					.then(function (createdRoute) {
						$scope.routes.push(createdRoute);

						routesMapService.updateRoutes($scope.routes);
						routesTableService.updateRoutes($scope.routes);

						routesMapService.select(createdRoute);
						routesTableService.select(createdRoute);
						$scope.selected = createdRoute;
					})
					.catch(function (error) {
						errorService.restangularError(error);
					});
			});
			editModal.result.catch(function () {
				// nothing to do, we just do not create the route
			});
		};

		$scope.editRoute = function (route) {
			// clone the route, so nothing changes until the editing is saved and discard just needs to do nothing
			var editModal = openEditModal(route.clone(), $scope.gym);

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

		$scope.archiveRoute = function (route) {
			var date = moment().toDate();
			gymService.archiveRoute(route, date)
				.then(function (archivedRoute) {
					_.remove($scope.routes, function(route) {
						return route.id === archivedRoute.id;
					});

					routesMapService.updateRoutes($scope.routes);
					routesTableService.updateRoutes($scope.routes);
				})
				.catch(function (error) {
					errorService.restangularError(error);
				});
		};

		$scope.deleteRoute = function (routeToDelete) {
			gymService.deleteRoute(routeToDelete)
				.then(function () {
					_.remove($scope.routes, function(route) {
						return route.id === routeToDelete.id;
					});

					routesMapService.updateRoutes($scope.routes);
					routesTableService.updateRoutes($scope.routes);
				})
				.catch(function (error) {
					errorService.restangularError(error);
				});
		};
	});