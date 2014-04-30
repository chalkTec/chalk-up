'use strict';

angular.module('chalkUpApp')
	.controller('StartCtrl', function ($scope, $state, Restangular, user) {
		$scope.gyms = Restangular.all('gyms').getList().$object;

		$scope.demoGymClick = function (gym) {
			if (user.current) {
				user.logout();
			}
			user.login({login: 'demo@chalkup.de', password: 'abcdef'}, function (error) {
				if(error) {
					console.log(error);
				}
				else {
					$state.go('admin', {id: gym.id});
				}
			});
		};
	});
