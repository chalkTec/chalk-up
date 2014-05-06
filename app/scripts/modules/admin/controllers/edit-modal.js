'use strict';

angular.module('chalkUpAdmin')
	.controller('EditModalCtrl', function ($scope, $q, $filter, loadingIndicator, gymService, gym, route) {
		$scope.gym = gym;
		$scope.route = route;
		// date
		$scope.route.dateSetDate = moment(route.dateSet).toDate();


		$scope.setters = function(typed) {
			var setters = $filter('filter')(gym.routeSetters, { nickname: typed });
			return $q.when(setters);
		};

		$scope.replaceIfKnownSetter = function(setter) {
			function equalNickname(routeSetter) {
				return setter.nickname === routeSetter.nickname
			}

			if(!setter.id) {
				// no setter was selected from the auto-complete
				if(_(gym.routeSetters).any(equalNickname)) {
					// but setter with the same nickname exists
					// => replace the setter in the list with the known route setter
					var index = _(route.setters).indexOf(setter);
					route.setters[index] = _(gym.routeSetters).find(equalNickname);
				}
			}
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