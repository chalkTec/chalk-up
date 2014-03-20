'use strict';

angular.module('imageMap', []);


angular.module('imageMap')
	.constant('imageMapPadding', 10);


angular.module('imageMap')
	.factory('imageMapService', function ($rootScope) {
		var config = {};

		var IMAGE_UPDATE_EVENT = 'imageMap:imageUpdate';
		var SELECTION_EVENT = 'imageMap:select';

		// the currently displayed image
		var image;

		config.updateImage = function (img) {
			image = img;
			$rootScope.$broadcast(IMAGE_UPDATE_EVENT, {image: image});
		};

		config.onImageUpdate = function ($scope, handler) {
			$scope.$on(IMAGE_UPDATE_EVENT, function (event, args) {
				handler(args.image);
			});
		};

		config.getImage = function () {
			return image;
		};

		var selectedMarker;

		config.select = function (marker) {
			selectedMarker = marker;
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
	.directive('imageMap', function ($rootScope, imageMapService) {
		var map;

		return {
			restrict: 'A',
			scope: {
				height: '@'
			},
			controller: function ($scope, $element, mapOverlay) {
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


				// RESIZE MAP
				map.on('resize', function () {
					$scope.$apply(function () {
						mapOverlay.drawImageOverlay(map, imageMapService.getImage());
					});
				});
			}
		};
	});
