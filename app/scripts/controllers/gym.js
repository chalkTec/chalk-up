'use strict';

angular.module('chalkUpApp')
	.controller('GymCtrl', function ($scope, $stateParams, routesMapService, gymService, feedbackService) {
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
				$scope.routes = routes;
			});
		});

		routesMapService.onSelectionChange($scope, function (route) {
			$scope.selected = route;
		});

		$scope.$watch('selected', function(selected, oldSelected) {
			if(selected === oldSelected) {
				return;
			}

			if(_.isUndefined(selected)) {
				routesMapService.clearSelection();
			}
			else {
				routesMapService.select(selected);
			}
		});


		$scope.openFeedbackPanel = feedbackService.openFeedbackPanel;
	});