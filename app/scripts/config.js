'use strict';

angular.module('chalkUpApp')
	.constant('apiEndpoint', 'http://chalk-up-api-staging.herokuapp.com/rest');
//	.constant('apiEndpoint', 'http://api.chalkup.de/rest');


angular.module('chalkUpApp')
	.config(function ($stateProvider, $urlRouterProvider, $httpProvider, RestangularProvider, apiEndpoint) {

		// For any unmatched url, redirect to /
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


		RestangularProvider.setBaseUrl(apiEndpoint);
		// this is done so that DELETE requests also have this header (see https://github.com/mgonto/restangular/issues/159)
		RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json'});
		RestangularProvider.addRequestInterceptor(function(element, operation, what, url) {
			// TODO: remove this as soon as this issue is fixed: https://github.com/restfulapi/restful-api/issues/6
			if(operation === "remove" || operation === "put") {
				delete element.id;
			}
			return element;
		});
	});
