'use strict';

angular.module('chalkUpApp')
	.controller('SignupCtrl', function ($scope, $state) {
		var nextState = 'start';

		$scope.oauthRedirectUri = window.location.protocol + '//' + window.location.host + window.location.pathname + $state.href(nextState);
	});
