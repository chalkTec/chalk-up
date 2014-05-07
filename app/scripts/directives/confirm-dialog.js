'use strict';

angular.module('chalkUpApp')
	.directive('confirmDialog', function () {

		return {
			restrict: 'A',
			scope: {
				confirmAction: '&',
				cancelAction: '&',
				confirmMessage: '@',
				confirmMessageUrl: '@',
				confirmYesLabel: '@'
			},
			controller: function ($scope, $modal) {
				$scope.openConfirm = function () {
					var confirmModal = $modal.open({
						templateUrl: '/views/confirm-dialog.html',
						windowClass: 'small confirm',
						scope: $scope
					});
					confirmModal.result
						.then(function () {
							$scope.confirmAction();
						}, function () {
							$scope.cancelAction();
						});
				};

				$scope.yesLabel = $scope.confirmYesLabel ? $scope.confirmYesLabel : 'Ja';
			},
			link: function (scope, element) {
				element.bind('click', scope.openConfirm);
			}
		};
	});