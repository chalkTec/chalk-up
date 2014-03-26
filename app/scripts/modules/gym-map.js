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

				$scope.select = function (boulder) {
					gymMapService.select(boulder);
				};

				$scope.openFeedbackPanel = feedbackService.openFeedbackPanel;
			}
		};
	});
