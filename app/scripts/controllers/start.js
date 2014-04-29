'use strict';

angular.module('chalkUpApp')
	.controller('StartCtrl', function ($scope, $state, Restangular, user, loginInterceptor) {
		$scope.gyms = Restangular.all('gyms').getList().$object;

		$scope.demoGymClick = function (gym) {
			if (user.current) {
				user.logout();
			}
			loginInterceptor.stateAfterLogin('admin', {id: gym.id});
			user.login({login: 'demo@chalkup.de', password: 'abcdef'}, function (error) {
				if(error) {
					console.log(error);
				}
			});
		};
	});
