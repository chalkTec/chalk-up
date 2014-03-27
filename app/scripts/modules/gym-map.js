'use strict';

angular.module('gymMap', ['restangular', 'imageMap', 'cuColor']);


angular.module('gymMap')
	.constant('GRADIENT_ANGLE', 45);

angular.module('gymMap')
	.factory('gymMapService', function ($rootScope, imageMapService, cuColorService, GRADIENT_ANGLE) {
		var config = {};


		// GYM

		// the currently displayed gym
		var _gym;

		config.updateGym = function (gym) {
			// updating image implicitly removes markers
			config.removeBoulders();

			_gym = gym;

			var floorPlan = _.first(gym.floorPlans);
			var image = {
				width: floorPlan.img.widthInPx,
				height: floorPlan.img.heightInPx,
				url: floorPlan.img.url
			};
			imageMapService.updateImage(image);
		};

		config.getGym = function () {
			return _gym;
		};


		// BOULDERS

		L.BoulderIcon = L.DivIcon.extend({
			options: {
				className: 'boulder-icon',
				iconSize: undefined,    // set with CSS (assignment to undefined is required!)
				iconAnchor: undefined,   // set with CSS (assignment to undefined is required!)
				color: { primary: 'black' }
			},
			createIcon: function (oldIcon) {
				var div = L.DivIcon.prototype.createIcon.call(this, oldIcon);
				var color = this.options.color;

				var css = cuColorService.getCss(color, GRADIENT_ANGLE);
				$(div).css(css);
				return div;
			}
		});

		L.boulderIcon = function (color) {
			return new L.BoulderIcon({color: color});
		};

		function markerForBoulder(boulder) {
			var l = boulder.location;
			return {
				id: boulder.id,
				x: l.x * l.floorPlan.img.widthInPx,
				y: l.y * l.floorPlan.img.heightInPx,
				icon: L.boulderIcon(boulder.color)
			};
		}

		function markerGroupsForBoulders(boulders) {
			var bouldersGroup = _.groupBy(boulders, function (boulder) {
				return boulder.color.germanName;
			});

			var markersGroup = {};
			_.each(bouldersGroup, function (boulders, color) {
				markersGroup[color] = _.map(boulders, markerForBoulder);
			});

			return markersGroup;
		}

		// the currently displayed boulders
		var _boulders;

		config.removeBoulders = function () {
			_boulders = undefined;

			imageMapService.removeMarkerGroups();
		};


		var bouldersForMarker;

		function boulderForMarker(marker) {
			return bouldersForMarker[marker.id];
		}

		var onImageMarkerSelectHandler;
		config.updateBoulders = function (boulders) {
			_boulders = boulders;

			var markerGroups = markerGroupsForBoulders(boulders);
			imageMapService.updateMarkerGroups(markerGroups);

			bouldersForMarker = _.indexBy(boulders, 'id');

			if (!_.isUndefined(onImageMarkerSelectHandler)) {
				// unregister handler
				onImageMarkerSelectHandler();
			}
			onImageMarkerSelectHandler = imageMapService.onSelectionChange($rootScope, function (marker) {
				// internally select the boulder (without propagating it to image map)
				if (_.isUndefined(marker)) {
					internalSelect(undefined);
				}
				else {
					internalSelect(boulderForMarker(marker));
				}
			});
		};

		config.getBoulders = function () {
			return _boulders;
		};


		// SELECTED BOULDER

		var SELECTION_EVENT = 'gymMap:select';

		var _selectedBoulder;

		config.clearSelection = function () {
			imageMapService.clearSelection();

			internalSelect(undefined);
		};

		function internalSelect(boulder) {
			_selectedBoulder = boulder;
			$rootScope.$broadcast(SELECTION_EVENT, {boulder: _selectedBoulder});
		}

		/* must not be invoked with undefined */
		config.select = function (boulder) {
			imageMapService.select(markerForBoulder(boulder));

			internalSelect(boulder);
		};

		/* installs a handler that is called when the selection changes (to another boulder or to undefined) */
		config.onSelectionChange = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
				handler(args.boulder);
			});
		};

		config.hasSelected = function () {
			return !_.isUndefined(config.getSelected());
		};

		config.getSelected = function () {
			return _selectedBoulder;
		};

		return config;
	});


angular.module('gymMap')
	.directive('gymMap', function ($rootScope, Restangular, gymMapService, imageMapService, loadingIndicator) {
		return {
			restrict: 'A',
			templateUrl: '/views/gym-map.html',
			scope: {
				gymId: '='
			},
			controller: function ($scope, feedbackService) {
				var gym = Restangular.one('gyms', $scope.gymId);
				var gymGet = gym.get();
				loadingIndicator.waitFor(gymGet);
				gymGet.catch(function () {
					$scope.gymLoadError = true;
				});

				var routesGet = gym.all('routes').getList();
				loadingIndicator.waitFor(routesGet);
				routesGet.catch(function () {
					$scope.routesLoadError = true;
				});

				gymGet.then(function (gym) {
					gymMapService.updateGym(gym);
					$scope.gym = gym;

					routesGet.then(function (routes) {
						gymMapService.updateBoulders(routes);
						$scope.routes = routes;
					});
				});

				gymMapService.onSelectionChange($scope, function (boulder) {
					$scope.selected = boulder;
				});

				$scope.openFeedbackPanel = feedbackService.openFeedbackPanel;


				gymMapService.onSelectionChange($scope, function (route) {
					if (_.isUndefined(route)) {
						$scope.gridOptions.selectAll(false);
					}
					else {
						selectRow(route);
					}
				});

				var doScroll = true;

				function selectRow(route) {
					var index = _.findIndex($scope.routes, function (r) {
						return r === route;
					});

					$scope.gridOptions.selectItem(index, true);
					var grid = $scope.gridOptions.ngGrid;
					if (doScroll) {
						$(grid.$viewport).animate({ scrollTop: grid.rowMap[index] * grid.config.rowHeight - 100 }, '300', 'swing');
					}
				}


				// that is a bit a mess: ng-grid uses an array to communicate the currently selected item (due to its ability of multi-selection)
				var selections = [];
				$scope.$watchCollection(function () {
					return selections;
				}, function () {
					if (selections.length !== 0) {
						doScroll = false;
						gymMapService.select(selections[0]);
						doScroll = true;
					}
				});

				$scope.gridOptions = {
					data: 'routes',
					multiSelect: false,
					selectedItems: selections,
					headerRowHeight: 50, // also set in CSS
					rowHeight: 40,
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
							cellTemplate: '<div class="ngCellText">{{row.entity.type == "boulder" ? row.entity[col.field].readable : row.entity[col.field].grade.uiaa}}</div>',
							width: '20%'
						},
						{
							field: 'name',
							displayName: 'Name',
							width: '30%'
						},
						{
							field: 'created',
							displayName: 'Datum',
							cellFilter: 'amDateFormat: "LL"'
						}
					]
				};
			}
		};
	});
