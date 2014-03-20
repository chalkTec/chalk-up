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

		config.updateMarkers = function (markers) {
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

		var _selectedMarker;

		config.select = function (marker) {
			_selectedMarker = marker;
			$rootScope.$broadcast(SELECTION_EVENT, {marker: marker});
		};

		config.onSelect = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
				handler(args.marker);
			});
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
	.factory('mapMarkers', function (mapProjection) {
		var config = {};

		var layerGroup;

		function removeMarkers(map) {
			if (!_.isUndefined(layerGroup)) {
				map.removeLayer(layerGroup);
			}
		}

		function imageMapMarkerToLeafletMarker(imageMapMarker, projection) {
			var latLng = projection.imagePointToLatLng([imageMapMarker.x, imageMapMarker.y]);
			var options = {
				riseOnHover: true
			};

			return L.marker(latLng, options);
		}

		function addMarkers(map, image, markers) {
			var projection = mapProjection.calculate(map, image);

			var leafletMarkers = _.map(markers, function(marker) {
				return imageMapMarkerToLeafletMarker(marker, projection);
			});

			layerGroup = L.layerGroup(leafletMarkers);
			map.addLayer(layerGroup);
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

		return config;
	});


angular.module('imageMap')
	.directive('imageMap', function ($rootScope, imageMapService) {
		var map;

		return {
			restrict: 'A',
			scope: {
				height: '@'
			},
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
				mapMarkers.drawMarkers(map, imageMapService.getImage(), imageMapService.getMarkers());

				imageMapService.onMarkersUpdate($scope, function (markers) {
					mapMarkers.drawMarkers(map, imageMapService.getImage(), markers);
				});


				// RESIZE MAP
				map.on('resize', function () {
					$scope.$apply(function () {
						mapOverlay.drawImageOverlay(map, imageMapService.getImage());
					});
				});
			}
		};
	});
