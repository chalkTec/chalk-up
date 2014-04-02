'use strict';

angular.module('chalkUpApp')
	.config(function ($stateProvider, $urlRouterProvider, $httpProvider, RestangularProvider) {

		// For any unmatched url, redirect to /state1
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('start', {
				url: '/',
				templateUrl: 'views/start.html',
				controller: 'StartCtrl'
			})
			.state('gym', {
				url: '/gym?id',
				templateUrl: 'views/gym.html',
				controller: 'GymCtrl'
			})
			.state('admin', {
				url: '/admin/gym?id',
				templateUrl: 'views/modules/admin/admin.html',
				controller: 'AdminCtrl'
			})
			.state('iframe', {
				url: '/iframe',
				templateUrl: 'views/iframe.html'
			});


		// send Cookie along with the CORS AJAX requests
		$httpProvider.defaults.withCredentials = true;
		// 10s timeout
		$httpProvider.defaults.timeout = 10000;


		var host = 'http://api.chalkup.de';

		RestangularProvider.setBaseUrl(host + '/rest');
	});
