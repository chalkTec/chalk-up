'use strict';

angular.module('chalkUpApp')
	.factory('loginInterceptor', function ($state) {

		var nextState = undefined;
		var nextParams = undefined;

		return {
			stateAfterLogin: function(state, params) {
				nextState = state;
				nextParams = params;
			},
			go: function() {
				if(!_.isUndefined(nextState)) {
					$state.go(nextState, nextParams);
					nextState = undefined;
					nextParams = undefined;
				}
				else {
					$state.go('start');
				}
			}
		};

	});
