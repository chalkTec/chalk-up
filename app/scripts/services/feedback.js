'use strict';

angular.module('chalkUpApp')
	.factory('feedbackService', function (trackingService) {
		var track = trackingService.event();

		return {
			openFeedbackPanel: function () {
				track('feedback', 'open');
				UserVoice.push(['show', { mode: 'contact' }]);
			}
		};
	});
