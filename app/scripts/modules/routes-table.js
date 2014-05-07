'use strict';

angular.module('routesTable', ['ngTable', 'cuColor']);


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
			if (route !== _selectedRoute) {
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
			templateUrl: '/views/routes-table.html',
			scope: {
			},
			controller: function ($scope, $filter, moment, routesTableService, ngTableParams) {
				function pad(n, width, z) {
					z = z || '0';
					n = n + '';
					return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
				}

				var allRoutes;

				/*jshint newcap: false */
				$scope.tableParams = new ngTableParams({
					/*jshint newcap: true */
					page: 1,            // show first page
					count: 10,           // count per page
					sorting: {
						numberSortable: 'asc'
					}
				}, {
					// the following two parameters hide pagination
					counts: [],
					total: 1,
					getData: function ($defer, params) {
						// use build-in angular filter
						var orderedData = params.sorting() ?
							$filter('orderBy')(allRoutes, params.orderBy()) :
							allRoutes;

						$defer.resolve(orderedData);
					}
				});


				routesTableService.onRoutesUpdate($scope, function (routes) {
					// fix sorting of number
					_.each(routes, function (route) {
						var numberThanAnything = /(\d*)(.*)/;
						var result = numberThanAnything.exec(route.number);
						route.numberSortable = pad(result[1], 5) + result[2];
					});

					// add 'new' property
					_.each(routes, function (route) {
						if (moment().diff(moment(route.dateSet), 'days', true) < 60) {
							route.new = true;
						}
					});

					allRoutes = routes;

					$scope.tableParams.reload();
				});


				// SELECT ROW IF SELECTION CHANGED EXTERNALLY
				routesTableService.onSelectionChange($scope, function (route) {
					$scope.selected = route;
					selectRouteRow(route);
				});

				$scope.selected = undefined;

				// NOTIFY OTHERS IF SELECTION CHANGED INTERNALLY
				var doScroll = true;

				$scope.select = function (route) {
					doScroll = false;
					routesTableService.select(route);
					doScroll = true;
					$scope.selected = route;
				};

				// TODO
				var rowHeight = 42;
				var tbodyHeight = 284;

				function selectRouteRow(route) {
					var index = _.findIndex($scope.tableParams.data, function (r) {
						return r === route;
					});

					if (doScroll) {
						var offset = index * rowHeight - (tbodyHeight / 2 - rowHeight / 2);
						$('tbody').animate({ scrollTop: offset }, '300', 'swing');
					}
				}


			}
		};
	});
