'use strict';

angular.module('chalkUpApp')
	.constant('apiEndpoint', 'http://chalk-up-api-staging.herokuapp.com/rest');
//	.constant('apiEndpoint', 'http://localhost:8080/rest');
//	.constant('apiEndpoint', 'http://api.chalkup.de/rest');


angular.module('chalkUpApp')
	.config(function ($stateProvider, $urlRouterProvider, $httpProvider, RestangularProvider, apiEndpoint) {

		// For any unmatched url, redirect to /
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('start', {
				url: '/',
				templateUrl: 'views/start.html',
				controller: 'StartCtrl',
				data: {
					public: true
				}
			})
			.state('gym', {
				url: '/gym?id',
				templateUrl: 'views/gym.html',
				controller: 'GymCtrl',
				data: {
					public: true
				}
			})
			.state('admin', {
				url: '/admin/gym?id',
				templateUrl: 'views/modules/admin/admin.html',
				controller: 'AdminCtrl',
				data: {
					public: false,
					authCheck: function (user, params) {
						var idParam = parseInt(params.id);
						var isAdmin, isRouteSetter, userGymId;
						/* jshint sub: true */
						isAdmin = user.permissions['admin'].value;
						isRouteSetter = user.permissions['route_setter'].value;
						userGymId = parseInt(user.properties['gym'].value);
						/* jshint sub: false */

						return isAdmin || (isRouteSetter && idParam === userGymId);
					}
				}
			})
			.state('iframe', {
				url: '/iframe',
				templateUrl: 'views/iframe.html',
				data: {
					public: true
				}
			})
			.state('login', {
				url: '/login',
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl',
				data: {
					login: true
				}
			})
			.state('signup', {
				url: '/signup',
				templateUrl: 'views/signup.html',
				controller: 'SignupCtrl',
				data: {
					public: true
				}
			})
			.state('accessDenied', {
				url: '/accessDenied',
				templateUrl: 'views/accessDenied.html',
				data: {
					public: true
				}
			});

		// send Cookie along with the CORS AJAX requests
		$httpProvider.defaults.withCredentials = true;
		// 10s timeout
		$httpProvider.defaults.timeout = 10000;


		RestangularProvider.setBaseUrl(apiEndpoint);
		// this is done so that DELETE requests also have this header (see https://github.com/mgonto/restangular/issues/159)
		RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json'});
	});
