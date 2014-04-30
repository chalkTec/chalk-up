'use strict';

angular.module('chalkUpApp')
	.controller('LoginCtrl', function ($scope, $state, $q, user, loadingIndicator, loginInterceptor) {
		$scope.oauthRedirectUri = window.location.protocol + '//' + window.location.host + window.location.pathname + loginInterceptor.stateAfterLoginUrl();

		$scope.credentials = {};

		$scope.login = function () {
			var deferred = $q.defer();
			var userLoggedIn = deferred.promise;

			user.login($scope.credentials, function (error, result) {
				if (error) {
					deferred.reject(error);
				} else {
					deferred.resolve(result);
				}
			});

			loadingIndicator.waitFor(userLoggedIn);

			userLoggedIn
				.then(function () {
					loginInterceptor.go();
				})
				.catch(function (error) {
					$scope.error = error;
				});
		}

	});
