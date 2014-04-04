'use strict';

angular.module('chalkUpApp')
	.directive('confirmDialog', function () {

		return {
			restrict: 'A',
			scope: {
				confirmAction: '&',
				confirmMessage: '@',
				confirmMessageUrl: '@'
			},
			controller: function($scope, $modal) {
				$scope.openConfirm = function() {
					var confirmModal = $modal.open({
						templateUrl: '/views/confirm-dialog.html',
						windowClass: 'small confirm',
						scope: $scope
					});
					confirmModal.result.then(function() {
						$scope.confirmAction();
					});
				};
			},
			link: function(scope, element) {
				element.bind('click', scope.openConfirm);
			}
		};
	});