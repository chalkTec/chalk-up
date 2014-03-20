'use strict';

angular.module('imageMap', []);


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
			// updating markers implicitly unselects
			config.unselect();

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

		var _selectedMarker;

		config.unselect = function () {
			config.select(undefined);
		};

		config.select = function (marker) {
			_selectedMarker = marker;
			$rootScope.$broadcast(SELECTION_EVENT, {marker: marker});
		};

		config.onSelect = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
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

		return config;
	});


angular.module('imageMap')
	.factory('mapMarkers', function ($rootScope, mapProjection, imageMapService) {
		var config = {};

		var markerIdToLeafletMarker;

		var layerGroups;
		var layerControl;

		function getLeafletMarker(imageMapMarker) {
			return markerIdToLeafletMarker[imageMapMarker.id];
		}

		function removeMarkerGroups(map) {
			if (!_.isUndefined(layerGroups)) {
				_.each(layerGroups, function (layerGroup) {
					map.removeLayer(layerGroup);
				});
				layerGroups = undefined;
				markerIdToLeafletMarker = undefined;
				layerControl.removeFrom(map);
				layerControl = undefined;
			}
		}

		function imageMapMarkerToLeafletMarker(imageMapMarker, projection) {
			var latLng = projection.imagePointToLatLng([imageMapMarker.x, imageMapMarker.y]);
			var options = {
				riseOnHover: true
			};

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
				map.addLayer(layerGroup);
			});

			layerControl = L.control.layers(undefined, layerGroups).addTo(map);

			// unselect marker if we hide the layer where the active marker was on
			map.on('overlayremove', function (e) {
				$rootScope.$apply(function () {
					if (imageMapService.hasSelected()) {
						var selectedLeafletMarker = getLeafletMarker(imageMapService.getSelected());
						var removedLayerGroup = e.layer;

						if (removedLayerGroup.hasLayer(selectedLeafletMarker)) {
							imageMapService.unselect();
						}
					}
				});
			});
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
			if (_.isUndefined(marker)) {
				return;
			}

			var leafletMarker = getLeafletMarker(marker);
			$(leafletMarker._icon).removeClass('selected');
		};

		config.markSelected = function (marker) {
			if (_.isUndefined(marker)) {
				return;
			}

			var leafletMarker = getLeafletMarker(marker);
			$(leafletMarker._icon).addClass('selected');
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


				// RESIZE MAP
				map.on('resize', function () {
					$scope.$apply(function () {
						mapOverlay.drawImageOverlay(map, imageMapService.getImage());
					});
				});


				// SELECT MARKER

				// click handler for each marker is set in mapMarkers.drawMarkerGroups()

				map.on('click', function () {
					$scope.$apply(function () {
						imageMapService.unselect();
					});
				});

				var selected;
				mapMarkers.markSelected(imageMapService.getSelected());
				imageMapService.onSelect($scope, function (marker) {
					mapMarkers.unmarkSelected(selected);
					mapMarkers.markSelected(marker);
					selected = marker;
				});
			}
		};
	});
