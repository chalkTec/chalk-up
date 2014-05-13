'use strict';

angular.module('chalkUpAdmin')
	.controller('AdminCtrl', function ($scope, $stateParams, $modal, moment, trackingService, gymService, routesMapService, routesTableService, errorService) {
		$scope.gymId = parseInt($stateParams.id);
		var track = trackingService.gymEvent($scope.gymId);

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
			if(_.isUndefined(route)) {
				track('route_selection', 'unselect');
			}
			else {
				track('route_selection', 'select', route.type);
			}
			routesTableService.select(route);
			$scope.selected = route;
		});

		routesTableService.onSelectionChange($scope, function (route) {
			routesMapService.select(route);
			$scope.selected = route;
		});

		routesTableService.onSortingChange($scope, function(sorting) {
			track('routes_table', 'sort', _(sorting).keys().first());
		});

		var openEditModal = function (route, gym) {
			return $modal.open({
				templateUrl: '/views/modules/admin/edit-route.html',
				windowClass: 'small edit',
				controller: 'EditModalCtrl',
				resolve: {
					gym: function() { return gym; },
					route: function() { return  route; }
				}
			});
		};


		var routeTemplate = {
			type: 'sport-route',
			color: {
				name: 'RED'
			},
			location: {
				x: 0,
				y: 0
			},
			initialGrade: {
				uiaa: '7+',
				font: '6c+'
			},
			setters: []
		};

		$scope.newRoute = function (gym, floorPlan) {
			track('new_route', 'start');

			var newRoute = _.cloneDeep(routeTemplate);
			newRoute.gym = gym;
			newRoute.location.floorPlan = floorPlan;

			var editModal = openEditModal(newRoute, gym);

			editModal.result.then(function (editedRoute) {
				track('new_route', 'save', editedRoute.type);

				gymService.createRoute(gym, editedRoute)
					.then(function (createdRoute) {
						$scope.routes.push(createdRoute);

						routesMapService.updateRoutes($scope.routes);
						routesTableService.updateRoutes($scope.routes);

						routesMapService.select(createdRoute);
						routesTableService.select(createdRoute);
						$scope.selected = createdRoute;

						// update template to reflect last created route
						routeTemplate.type = createdRoute.type;
						routeTemplate.color = createdRoute.color;
						routeTemplate.setters = createdRoute.setters;
						if (createdRoute.type === 'sport-route') {
							routeTemplate.initialGrade.uiaa = createdRoute.initialGrade.uiaa;
						}
						if (createdRoute.type === 'boulder') {
							routeTemplate.initialGrade.font = createdRoute.initialGrade.font;
						}
					})
					.catch(function (error) {
						errorService.restangularError(error);
					});
			});
			editModal.result.catch(function () {
				track('new_route', 'discard');
				// nothing to do, we just do not create the route
			});
		};

		$scope.getRoutesForCsv = function () {
			return _.map($scope.routes, function (route) {
				var exportRoute = {
					type: undefined,
					name: route.name,
					number: route.number,
					grade: undefined,
					color: route.color.germanName,
					description: route.description,
					dateSet: moment(route.dateSet).format('DD.MM.YYYY'),
					setters: _(route.setters).pluck('nickname').join(', '),
					end: route.end ? moment(route.end).format('DD.MM.YYYY') : undefined
				};

				if (route.type === 'sport-route') {
					exportRoute.type = 'Sportklettertour';
					exportRoute.grade = route.initialGrade.uiaa;
				}
				else if (route.type === 'boulder') {
					exportRoute.type = 'Boulder';
					exportRoute.grade = route.initialGrade.font;
				}
				else {
					throw new Error('route type not known');
				}

				return exportRoute;
			});
		};

		$scope.csvHeader = ['Typ', 'Name', 'Nummer', 'Grad', 'Farbe', 'Beschreibung', 'geschraubt am', 'von', 'abgeschraubt am'];
		$scope.filename = 'routes-' + moment().format() + '.csv';

		$scope.trackExportCsv = function() {
			track('export_routes', 'click');
		};

		$scope.editRoute = function (route) {
			track('edit_route', 'start');

			// clone the route, so nothing changes until the editing is saved and discard just needs to do nothing
			var editModal = openEditModal(route.clone(), $scope.gym);

			editModal.result.then(function (editedRoute) {
				track('edit_route', 'save', editedRoute.type);

				gymService.updateRoute(editedRoute)
					.then(function (updatedRoute) {
						var oldRoute = _.find($scope.routes, function (route) {
							return route.id === updatedRoute.id;
						});
						_.assign(oldRoute, updatedRoute);
						routesMapService.updateRoute(updatedRoute);
					})
					.catch(function (error) {
						errorService.restangularError(error);
					});
			});
			editModal.result.catch(function () {
				track('edit_route', 'discard');
				// nothing to do, we just do not merge the route
			});
		};

		$scope.movingRoute = undefined;

		var oldLocation;
		$scope.moveRoute = function (route) {
			track('move_route', 'start');

			$scope.movingRoute = route;
			oldLocation = { x: route.location.x, y: route.location.y };
			routesMapService.moveRouteStart(route);
		};

		$scope.saveLocation = function () {
			track('move_route', 'save', $scope.movingRoute.type);

			gymService.updateRoute($scope.movingRoute)
				.then(function (updatedRoute) {
					// also merge updated route since position/version changed
					var oldRoute = _.find($scope.routes, function (route) {
						return route.id === updatedRoute.id;
					});
					_.assign(oldRoute, updatedRoute);
					routesMapService.updateRoute(updatedRoute);
				})
				.catch(function (error) {
					errorService.restangularError(error);
				});
			routesMapService.moveRouteEnd($scope.movingRoute);
			$scope.movingRoute = undefined;
		};
		$scope.discardLocation = function () {
			track('move_route', 'discard');

			routesMapService.moveRouteEnd($scope.movingRoute);
			$scope.movingRoute.location.x = oldLocation.x;
			$scope.movingRoute.location.y = oldLocation.y;
			routesMapService.updateRoute($scope.movingRoute);
			$scope.movingRoute = undefined;
		};


		$scope.archiveRoute = function (route) {
			track('archive_route', 'confirm', route.type);

			var date = moment().toDate();
			gymService.archiveRoute(route, date)
				.then(function (archivedRoute) {
					_.remove($scope.routes, function (route) {
						return route.id === archivedRoute.id;
					});

					routesMapService.updateRoutes($scope.routes);
					routesTableService.updateRoutes($scope.routes);
				})
				.catch(function (error) {
					errorService.restangularError(error);
				});
		};

		$scope.cancelArchiveRoute = function(route) {
			track('archive_route', 'cancel', route.type);
		};


		$scope.deleteRoute = function (routeToDelete) {
			track('delete_route', 'confirm', routeToDelete.type);

			gymService.deleteRoute(routeToDelete)
				.then(function () {
					_.remove($scope.routes, function (route) {
						return route.id === routeToDelete.id;
					});

					routesMapService.updateRoutes($scope.routes);
					routesTableService.updateRoutes($scope.routes);
				})
				.catch(function (error) {
					errorService.restangularError(error);
				});
		};

		$scope.cancelDeleteRoute = function(route) {
			track('delete_route', 'cancel', route.type);
		};
	});