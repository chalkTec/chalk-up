'use strict';

angular.module('routesTable', ['ngGrid', 'cuColor']);


angular.module('routesTable')
	.factory('routesTableService', function ($rootScope) {
		var config = {};


		// ROUTES

		var ROUTES_EVENT = 'routesTable:routes';


		// the currently displayed routes
		var _routes;

		config.removeRoutes = function () {
			_routes = undefined;

			config.updateRoutes(undefined);
		};

		config.updateRoutes = function (routes) {
			_routes = routes;

			$rootScope.$broadcast(ROUTES_EVENT, {routes: routes});
		};

		config.onRoutesUpdate = function ($scope, handler) {
			$scope.$on(ROUTES_EVENT, function (event, args) {
				handler(args.routes);
			});
		};

		config.getRoutes = function () {
			return _routes;
		};


		// SELECTED ROUTE

		var SELECTION_EVENT = 'routesTable:select';

		var _selectedRoute;

		config.clearSelection = function () {
			internalSelect(undefined);
		};

		function internalSelect(route) {
			if(route !== _selectedRoute) {
				_selectedRoute = route;
				$rootScope.$broadcast(SELECTION_EVENT, {route: _selectedRoute});
			}
		}

		config.select = function (route) {
			internalSelect(route);
		};

		/* installs a handler that is called when the selection changes (to another route or to undefined) */
		config.onSelectionChange = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
				handler(args.route);
			});
		};

		config.hasSelected = function () {
			return !_.isUndefined(config.getSelected());
		};

		config.getSelected = function () {
			return _selectedRoute;
		};

		return config;

	});


angular.module('routesTable')
	.directive('routesTable', function () {
		return {
			restrict: 'A',
			template: '<div ng-grid="gridOptions" style="height: 100%;"></div>',
			scope: {
			},
			controller: function ($scope, routesTableService) {
				routesTableService.onRoutesUpdate($scope, function(routes) {
					$scope.routes = routes;
				});


				// DEFINE NG-GRID OPTIONS
				var gradeSort = function(a, b) {
					return a.value - b.value;
				};

				$scope.selections = [];

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
							cellFilter: 'grade: row.entity.type == "boulder" ? "font" : "uiaa"',
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

				// SELECT ROW IF SELECTION CHANGED EXTERNALLY
				routesTableService.onSelectionChange($scope, function(route) {
					if (_.isUndefined(route)) {
						$scope.gridOptions.selectAll(false);
					}
					else {
						selectRouteRow(route);
					}
				});

				var doScroll = true;

				function selectRouteRow(route) {
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

				// NOTIFY OTHERS IF SELECTION CHANGED INTERNALLY

				// that is a bit a mess: ng-grid uses an array to communicate the currently selected item (due to its ability of multi-selection)
				$scope.$watchCollection('selections', function (selections) {
					if (selections.length !== 0) {
						doScroll = false;
						routesTableService.select(selections[0]);
						doScroll = true;
					}
					else {
						routesTableService.clearSelection();
					}
				});
			}
		};
	});
