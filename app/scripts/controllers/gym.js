'use strict';

angular.module('chalkUpApp')
	.controller('GymCtrl', function ($scope, $stateParams, Restangular, routesMapService, loadingIndicator, feedbackService) {
		$scope.gymId = $stateParams.id;

		var gym = Restangular.one('gyms', $scope.gymId);
		var gymGet = gym.get();
		loadingIndicator.waitFor(gymGet);
		gymGet.catch(function () {
			$scope.gymLoadError = true;
		});

		var routesGet = gym.all('routes').getList();
		loadingIndicator.waitFor(routesGet);
		routesGet.catch(function () {
			$scope.routesLoadError = true;
		});

		gymGet.then(function (gym) {
			routesMapService.updatePlan(gym.floorPlans[0]);
			$scope.gym = gym;

			routesGet.then(function (routes) {
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