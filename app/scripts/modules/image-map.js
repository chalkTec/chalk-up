'use strict';

angular.module('imageMap', []);

angular.module('imageMap')
	.factory('imageMapService', function ($rootScope) {
		var config = {};

		var IMAGE_UPDATE_EVENT = 'imageMap:imageUpdate';
		var SELECTION_EVENT = 'imageMap:select';

		// the currently displayed image
		var image = undefined;

		config.updateImage = function (img) {
			image = img;
			$rootScope.$broadcast(IMAGE_UPDATE_EVENT, {image: image});
		};

		config.onImageUpdate = function ($scope, handler) {
			$scope.$on(IMAGE_UPDATE_EVENT, function (event, args) {
				handler(args.image);
			});
		};

		var selectedMarker = undefined;

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