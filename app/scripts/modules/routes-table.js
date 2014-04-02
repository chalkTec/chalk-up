'use strict';

angular.module('routesTable', ['ngGrid']);

angular.module('routesTable')
	.directive('routesTable', function () {
		return {
			restrict: 'A',
			template: '<div ng-grid="gridOptions" style="height: 100%;"></div>',
			scope: {
				routes: '=',
				selected: '='
			},
			controller: function ($scope) {
				$scope.$watch('selected', function (route) {
					if (_.isUndefined(route)) {
						$scope.gridOptions.selectAll(false);
					}
					else {
						selectRoute(route);
					}
				});

				var doScroll = true;

				function selectRoute(route) {
					var index = _.findIndex($scope.routes, function (r) {
						return r === route;
					});

					$scope.gridOptions.selectItem(index, true);
					var grid = $scope.gridOptions.ngGrid;
					if (doScroll) {
						var offset = grid.rowMap[index] * grid.config.rowHeight - (grid.$viewport.height() / 2 - grid.config.rowHeight / 2);
						$(grid.$viewport).animate({ scrollTop: offset }, '300', 'swing');
					}
				}


				// that is a bit a mess: ng-grid uses an array to communicate the currently selected item (due to its ability of multi-selection)
				$scope.selections = [];
				$scope.$watchCollection('selections', function (selections) {
					if (selections.length !== 0) {
						doScroll = false;
						$scope.selected = selections[0];
						doScroll = true;
					}
				});

				var gradeSort = function(a, b) {
					return a.value - b.value;
				};

				$scope.gridOptions = {
					data: 'routes',
					multiSelect: false,
					selectedItems: $scope.selections,
					headerRowHeight: 50, // also set in CSS
					rowHeight: 40, // also set in CSS
					columnDefs: [
						{
							field: 'number',
							displayName: 'Nummer',
							width: '10%'
						},
						{
							field: 'color',
							displayName: 'Farbe',
							sortable: false,
							cellTemplate: '<div class="ngCellText"><span class="color-indicator" cu-color="row.entity[col.field]" angle="45"></span> {{row.entity[col.field].germanName}}</div>',
							width: '20%'
						},
						{
							field: 'initialGrade',
							displayName: 'Grad',
							sortFn: gradeSort,
							cellFilter: 'grade: "uiaa"',
							width: '20%'
						},
						{
							field: 'name',
							displayName: 'Name',
							width: '30%'
						},
						{
							field: 'dateSet',
							displayName: 'Datum',
							cellFilter: 'amDateFormat: "LL"'
						}
					]
				};
			}
		};
	});
