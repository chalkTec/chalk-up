'use strict';

angular.module('imageMap', []);

angular.module('imageMap')
	.config(function () {
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
			config.removeMarkers();

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
		var _markers;

		config.removeMarkers = function () {
			config.updateMarkers(undefined);
		};

		config.updateMarkers = function (markers) {
			// updating markers implicitly clears selection
			config.clearSelection();

			_markers = markers;
			$rootScope.$broadcast(MARKERS_EVENT, {markers: markers});
		};

		config.onMarkersUpdate = function ($scope, handler) {
			$scope.$on(MARKERS_EVENT, function (event, args) {
				handler(args.markers);
			});
		};

		config.getMarkers = function () {
			return _markers;
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

		var leafletMarkers;

		config.getLeafletMarker = function (imageMapMarker) {
			return markerIdToLeafletMarker[imageMapMarker.id];
		};

		function removeMarkers(map) {
			if (!_.isUndefined(leafletMarkers)) {
				_.each(leafletMarkers, function (marker) {
					map.removeLayer(marker);
				});

				leafletMarkers = undefined;
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

		function addMarkers(map, image, markers) {
			var projection = mapProjection.calculate(map, image);

			markerIdToLeafletMarker = {};
			leafletMarkers = [];
			_.each(markers, function (marker) {
				var leafletMarker = imageMapMarkerToLeafletMarker(marker, projection);
				leafletMarkers.push(leafletMarker);
				leafletMarker.addTo(map);
				markerIdToLeafletMarker[marker.id] = leafletMarker;
				return leafletMarker;
			});
		}

		config.drawMarkers = function (map, image, markers) {
			// we need an image to draw markers on it
			if (_.isUndefined(image) || _.isUndefined(markers)) {
				removeMarkers(map);
				return;
			}

			// remove old markers
			removeMarkers(map);

			addMarkers(map, image, markers);
		};

		config.unmarkSelected = function (marker) {
			var leafletMarker = config.getLeafletMarker(marker);
			$(leafletMarker._icon).removeClass('selected');
		};

		config.markSelected = function (marker) {
			var leafletMarker = config.getLeafletMarker(marker);
			$(leafletMarker._icon).addClass('selected');
		};

		config.panTo = function(map, marker) {
			var leafletMarker = config.getLeafletMarker(marker);
			// animate true does not work properly:
			// - little movements even when zoomed out entirely
			// - animated panning to a point and then zooming out does not take max bounds into account
			map.panTo(leafletMarker.getLatLng());
		};

		config.destroy = function (map) {
			removeMarkers(map);
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
					zoomControl: true
				});
				map.setView([0, 0], 0);


				// IMAGE OVERLAY
				mapOverlay.drawImageOverlay(map, imageMapService.getImage());

				imageMapService.onImageUpdate($scope, function (img) {
					mapOverlay.drawImageOverlay(map, img);
				});


				// MARKERS
				mapMarkers.drawMarkers(map, imageMapService.getImage(), imageMapService.getMarkers());

				imageMapService.onMarkersUpdate($scope, function (markers) {
					mapMarkers.drawMarkers(map, imageMapService.getImage(), markers);
				});


				// SELECT MARKER

				// click handler for each marker is set in mapMarkers.drawMarkers()

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
						mapMarkers.panTo(map, marker);
					}
				});
				imageMapService.onUnselect($scope, function (marker) {
					mapMarkers.unmarkSelected(marker);
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
						mapMarkers.drawMarkers(map, imageMapService.getImage(), imageMapService.getMarkers());
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
