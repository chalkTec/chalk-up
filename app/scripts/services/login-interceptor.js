'use strict';

angular.module('chalkUpApp')
	.factory('loginInterceptor', function ($state) {

		var defaultState = 'start';

		var nextState = defaultState;
		var nextParams = {};

		return {
			stateAfterLogin: function(state, params) {
				nextState = state;
				nextParams = params;
			},
			stateAfterLoginUrl: function() {
				return $state.href(nextState, nextParams);
			},
			go: function() {
				if(!_.isUndefined(nextState)) {
					$state.go(nextState, nextParams);
					nextState = defaultState;
					nextParams = {};
				}
				else {
					$state.go('start');
				}
			}
		};

	});
