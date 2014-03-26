'use strict';

angular.module('chalkUpApp')
	.factory('feedbackService', function LoadingIndicator() {
		return {
			openFeedbackPanel: function () {
				UserVoice.push(['show', { mode: 'contact' }]);
			}
		};
	});
