'use strict';

angular.module('chalkUpAdmin')
	.controller('EditModalCtrl', function ($scope, $q, loadingIndicator, gymService, gym, route) {
		$scope.gym = gym;
		$scope.route = route;
		// date
		$scope.route.dateSetDate = moment(route.dateSet).toDate();

		// route setters
		$scope.removeSetter = function(index) {
			route.setters.splice(index, 1);
		};
		$scope.addSetter = function() {
			route.setters.push({});
		};

		$scope.save = function (route) {
			// date
			route.dateSet = moment(route.dateSetDate).format();
			delete route.dateSetDate;

			// route setters
			var routeSetterCreation = [];
			var routeSetters = _.indexBy(gym.routeSetters, 'nickname');
			_.each(route.setters, function(setter) {
				var routeSetterCreated;
				if(!_.has(routeSetters, setter.nickname)) {
					routeSetterCreated = gymService.createRouteSetter(gym, setter);
					routeSetterCreated.then(function(routeSetter) {
						// add the newly created route setter to the ones available for gym
						// so we do not need to reload the gym
						gym.routeSetters.push(routeSetter);
					});
					routeSetterCreation.push(routeSetterCreated);
					loadingIndicator.waitFor(routeSetterCreated);
				}
				else {
					routeSetterCreated = $q.when(routeSetters[setter.nickname]);
				}

				routeSetterCreated.then(function(routeSetter) {
					_.assign(setter, routeSetter);
				});
			});

			// wait for all route setters to be created before returning
			// otherwise, route creation might fail because an associated route setter is not created first
			$q.all(routeSetterCreation).then(function() {
				$scope.$close(route);
			});
		};
		$scope.discard = function () {
			$scope.$dismiss();
		};
	});