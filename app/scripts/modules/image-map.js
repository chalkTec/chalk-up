'use strict';

angular.module('imageMap', []);

angular.module('imageMap')
	.config(function() {
		L.Icon.Default.imagePath = '/bower_components/leaflet-dist/images';
	});

angular.module('imageMap')
	.constant('imageMapPadding', 10);


angular.module('imageMap')
	.factory('imageMapService', function ($rootScope) {
		var config = {};

		// IMAGE

		var IMAGE_UPDATE_EVENT = 'imageMap:imageUpdate';

		// the currently displayed image
		var _image;

		config.updateImage = function (image) {
			// updating image implicitly removes markers
			config.removeMarkerGroups();

			_image = image;
			$rootScope.$broadcast(IMAGE_UPDATE_EVENT, {image: _image});
		};

		config.onImageUpdate = function ($scope, handler) {
			$scope.$on(IMAGE_UPDATE_EVENT, function (event, args) {
				handler(args.image);
			});
		};

		config.getImage = function () {
			return _image;
		};

		// MARKERS

		var MARKERS_EVENT = 'imageMap:markers';

		// the currently active markers
		var _markerGroups;

		config.removeMarkerGroups = function () {
			config.updateMarkerGroups(undefined);
		};

		config.updateMarkerGroups = function (markerGroups) {
			// updating markers implicitly clears selection
			config.clearSelection();

			_markerGroups = markerGroups;
			$rootScope.$broadcast(MARKERS_EVENT, {markerGroups: markerGroups});
		};

		config.onMarkerGroupsUpdate = function ($scope, handler) {
			$scope.$on(MARKERS_EVENT, function (event, args) {
				handler(args.markerGroups);
			});
		};

		config.getMarkerGroups = function () {
			return _markerGroups;
		};


		// SELECTED MARKER

		var SELECTION_EVENT = 'imageMap:select';
		var UNSELECTION_EVENT = 'imageMap:unselect';


		var _selectedMarker;

		config.clearSelection = function () {
			internalSelect(undefined);
		};

		function internalSelect(marker) {
			var previousSelected = _selectedMarker;
			_selectedMarker = marker;
			if (!_.isUndefined(previousSelected)) {
				$rootScope.$broadcast(UNSELECTION_EVENT, {marker: previousSelected});
			}

			$rootScope.$broadcast(SELECTION_EVENT, {marker: _selectedMarker});
		}

		config.select = function (marker) {
			internalSelect(marker);
		};

		/* installs a handler that is called when the selection changes (to another marker or to undefined) */
		config.onSelectionChange = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
				handler(args.marker);
			});
		};

		/* installs a handler that is called when a marker is unselected */
		config.onUnselect = function ($scope, handler) {
			$scope.$on(UNSELECTION_EVENT, function (event, args) {
				handler(args.marker);
			});
		};

		config.hasSelected = function () {
			return !_.isUndefined(config.getSelected());
		};

		config.getSelected = function () {
			return _selectedMarker;
		};


		return config;
	});


angular.module('imageMap')
	.service('mapProjection', function (imageMapPadding) {
		this.calculate = function (map, image) {
			var containerWidth = map.getSize().x - imageMapPadding * 2;
			var containerHeight = map.getSize().y - imageMapPadding * 2;
			var containerAspectRatio = containerHeight / containerWidth;

			var imageAspectRatio = image.height / image.width;

			var resultingWidth, resultingHeight, xOffset, yOffset;
			if (containerAspectRatio >= imageAspectRatio) {
				// image plan is wider, => fit to containerWidth
				resultingWidth = containerWidth;
				resultingHeight = image.height * containerWidth / image.width;
				xOffset = imageMapPadding;
				yOffset = (containerHeight - resultingHeight) / 2 + imageMapPadding;
			}
			else {
				// image plan is higher, => fit to containerHeight
				resultingWidth = image.width * containerHeight / image.height;
				resultingHeight = containerHeight;
				xOffset = (containerWidth - resultingWidth) / 2 + imageMapPadding;
				yOffset = imageMapPadding;
			}

			var southWestCorner = map.containerPointToLatLng([xOffset, resultingHeight + yOffset]);
			var northEastCorner = map.containerPointToLatLng([xOffset + resultingWidth, yOffset]);

			var scaleFactor = image.width / resultingWidth;

			return {
				latLngBounds: L.latLngBounds(southWestCorner, northEastCorner),
				latLngToImagePoint: function (latLng) {
					return map.project(L.latLng(latLng), 0).add([resultingWidth / 2, resultingHeight / 2]).multiplyBy(scaleFactor);
				},
				imagePointToLatLng: function (point) {
					return map.unproject(L.point(point).divideBy(scaleFactor).subtract([resultingWidth / 2, resultingHeight / 2]), 0);
				}
			};
		};
	});


angular.module('imageMap')
	.factory('mapOverlay', function (mapProjection) {
		var config = {};

		var overlay;

		function removeOverlay(map) {
			if (!_.isUndefined(overlay)) {
				map.removeLayer(overlay);
				overlay = undefined;
				map.setMaxBounds(undefined);
			}
		}

		function addOverlay(map, image) {
			var projection = mapProjection.calculate(map, image);

			// add new overlay
			overlay = L.imageOverlay(image.url, projection.latLngBounds, {
				noWrap: true
			});
			overlay.addTo(map);
			map.setMaxBounds(projection.latLngBounds);
		}

		config.drawImageOverlay = function (map, image) {
			if (_.isUndefined(image)) {
				removeOverlay(map);
				return;
			}

			// remove old overlay
			removeOverlay(map);

			addOverlay(map, image);
		};

		config.destroy = function (map) {
			removeOverlay(map);
		};

		return config;
	});


angular.module('imageMap')
	.factory('mapMarkers', function ($rootScope, mapProjection, imageMapService) {
		var config = {};

		var markerIdToLeafletMarker;

		var layerGroups;
		var layerControl;

		config.getLeafletMarker = function (imageMapMarker) {
			return markerIdToLeafletMarker[imageMapMarker.id];
		};

		function removeMarkerGroups(map) {
			if (!_.isUndefined(layerGroups)) {
				layerControl.removeFrom(map);
				// TODO: remove this as soon as the following pull request ended up in leaflet-dist
				// https://github.com/jack-kerouac/Leaflet/commit/59a8c00a1850103f4fba8561961282eb21b29e7d
				map
					.off('layeradd', layerControl._onLayerChange, layerControl)
					.off('layerremove', layerControl._onLayerChange, layerControl);

				layerControl = undefined;

				_.each(layerGroups, function (layerGroup) {
					map.removeLayer(layerGroup);
				});

				layerGroups = undefined;
				markerIdToLeafletMarker = undefined;
			}
		}

		function imageMapMarkerToLeafletMarker(imageMapMarker, projection) {
			var latLng = projection.imagePointToLatLng([imageMapMarker.x, imageMapMarker.y]);
			var options = {
				riseOnHover: true
			};
			if (imageMapMarker.icon) {
				options.icon = imageMapMarker.icon;
			}

			var marker = L.marker(latLng, options);

			marker.on('click', function () {
				$rootScope.$apply(function () {
					imageMapService.select(imageMapMarker);
				});
			});

			return marker;
		}

		function addMarkerGroups(map, image, markerGroups) {
			var projection = mapProjection.calculate(map, image);

			markerIdToLeafletMarker = {};
			layerGroups = {};
			_.each(markerGroups, function (markerGroup, name) {
				var leafletMarkers = _.map(markerGroup, function (marker) {
					var leafletMarker = imageMapMarkerToLeafletMarker(marker, projection);
					markerIdToLeafletMarker[marker.id] = leafletMarker;
					return leafletMarker;
				});
				var layerGroup = L.layerGroup(leafletMarkers);
				layerGroups[name] = layerGroup;
				layerGroup.addTo(map);
			});

			layerControl = L.control.layers(undefined, layerGroups).addTo(map);
		}

		config.drawMarkerGroups = function (map, image, markerGroups) {
			// we need an image to draw markers on it
			if (_.isUndefined(image) || _.isUndefined(markerGroups)) {
				removeMarkerGroups(map);
				return;
			}

			// remove old markers
			removeMarkerGroups(map);

			addMarkerGroups(map, image, markerGroups);
		};

		config.unmarkSelected = function (marker) {
			var leafletMarker = config.getLeafletMarker(marker);
			$(leafletMarker._icon).removeClass('selected');
		};

		config.markSelected = function (marker) {
			var leafletMarker = config.getLeafletMarker(marker);
			$(leafletMarker._icon).addClass('selected');
		};

		config.destroy = function (map) {
			removeMarkerGroups(map);
		};


		return config;
	});


angular.module('imageMap')
	.directive('imageMap', function ($rootScope, imageMapService) {
		var map;

		return {
			restrict: 'A',
			scope: {},
			controller: function ($scope, $element, mapOverlay, mapMarkers) {
				// SETUP MAP
				map = L.map($element[0], {
					maxZoom: 3,
					crs: L.CRS.Simple,
					attributionControl: false,
					zoomControl: false
				});
				map.setView([0, 0], 0);


				// IMAGE OVERLAY
				mapOverlay.drawImageOverlay(map, imageMapService.getImage());

				imageMapService.onImageUpdate($scope, function (img) {
					mapOverlay.drawImageOverlay(map, img);
				});


				// MARKERS
				mapMarkers.drawMarkerGroups(map, imageMapService.getImage(), imageMapService.getMarkerGroups());

				imageMapService.onMarkerGroupsUpdate($scope, function (markers) {
					mapMarkers.drawMarkerGroups(map, imageMapService.getImage(), markers);
				});


				// SELECT MARKER

				// click handler for each marker is set in mapMarkers.drawMarkerGroups()

				map.on('click', function () {
					$scope.$apply(function () {
						imageMapService.clearSelection();
					});
				});

				if (imageMapService.hasSelected()) {
					mapMarkers.markSelected(imageMapService.getSelected());
				}
				imageMapService.onSelectionChange($scope, function (marker) {
					if (!_.isUndefined(marker)) {
						mapMarkers.markSelected(marker);
					}
				});
				imageMapService.onUnselect($scope, function (marker) {
					mapMarkers.unmarkSelected(marker);
				});


				// clearSelection marker if we hide the layer where the active marker was on
				map.on('overlayremove', function (e) {
					$rootScope.$apply(function () {
						if (imageMapService.hasSelected()) {
							var selectedLeafletMarker = mapMarkers.getLeafletMarker(imageMapService.getSelected());
							var removedLayerGroup = e.layer;

							if (removedLayerGroup.hasLayer(selectedLeafletMarker)) {
								imageMapService.clearSelection();
							}
						}
					});
				});

				// mark marker as selected when we add the layer where the selected marker is on
				map.on('overlayadd', function (e) {
					$rootScope.$apply(function () {
						if (imageMapService.hasSelected()) {
							var selectedLeafletMarker = mapMarkers.getLeafletMarker(imageMapService.getSelected());
							var addedLayerGroup = e.layer;

							if (addedLayerGroup.hasLayer(selectedLeafletMarker)) {
								mapMarkers.markSelected(imageMapService.getSelected());
							}
						}
					});
				});

				var setZoomClass = function () {
					var $container = $(map.getContainer());
					for (var i = 0; i < 15; i++) {
						$container.removeClass('zoom-' + i);
					}

					$container.addClass('zoom-' + map.getZoom());
				};
				setZoomClass();
				map.on('zoomend', function () {
					$scope.$apply(setZoomClass);
				});

				// RESIZE MAP
				map.on('resize', function () {
					$scope.$apply(function () {
						map.setView([0, 0], 0, { reset: true});
						mapOverlay.drawImageOverlay(map, imageMapService.getImage());
						mapMarkers.drawMarkerGroups(map, imageMapService.getImage(), imageMapService.getMarkerGroups());
						if (imageMapService.hasSelected()) {
							mapMarkers.markSelected(imageMapService.getSelected());
						}
					});
				});


				$scope.$on('$destroy', function () {
					mapMarkers.destroy(map);
					mapOverlay.destroy(map);
					map.remove();
					map = undefined;
				});
			}
		};
	});
