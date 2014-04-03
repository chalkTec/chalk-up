'use strict';

angular.module('chalkUpApp')
	.controller('GymCtrl', function ($scope, $stateParams, routesMapService, routesTableService, gymService, feedbackService) {
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
			});
		});

		routesMapService.onSelectionChange($scope, function (route) {
			routesTableService.select(route);
			$scope.selected = route;
		});

		routesTableService.onSelectionChange($scope, function(route) {
			routesMapService.select(route);
			$scope.selected = route;
		});

		$scope.openFeedbackPanel = feedbackService.openFeedbackPanel;
	});