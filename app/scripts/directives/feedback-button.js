'use strict';

angular.module('chalkUpApp')
	.directive('feedbackButton', function () {

		return {
			restrict: 'A',
			template: '<a ng-click="openFeedbackPanel()"><i class="fi-mail"></i><span class="button-label">Probleme?</span></a>',
			scope: {},
			controller: function($scope, feedbackService) {
				$scope.openFeedbackPanel = feedbackService.openFeedbackPanel;
			}
		};
	});