'use strict';

angular.module('chalkUpApp')
	.controller('GymCtrl', function ($scope, $stateParams, trackingService, routesMapService, routesTableService, gymService, feedbackService) {
		$scope.gymId = $stateParams.id;
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
			routesMapService.updatePlan(gym.floorPlans[0]);
			$scope.gym = gym;

			routesLoad.then(function (routes) {
				routesMapService.updateRoutes(routes);
				routesTableService.updateRoutes(routes);
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

		routesTableService.onSelectionChange($scope, function(route) {
			routesMapService.select(route);
			$scope.selected = route;
		});

		routesTableService.onSortingChange($scope, function(sorting) {
			track('routes_table', 'sort', _(sorting).keys().first());
		});

		$scope.openFeedbackPanel = feedbackService.openFeedbackPanel;
	});