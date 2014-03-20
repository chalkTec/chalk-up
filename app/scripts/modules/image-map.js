'use strict';

angular.module('imageMap', []);

angular.module('imageMap')
	.factory('imageMapService', function ($rootScope) {
		var config = {};

		var DRAW_EVENT = 'imageMap:draw';
		var SELECTION_EVENT = 'imageMap:select';

		var lastImageMap = undefined;

		config.update = function (imageMap) {
			lastImageMap = imageMap;
			$rootScope.$broadcast(DRAW_EVENT, {imageMap: imageMap});
		};

		config.redraw = function () {
			$rootScope.$broadcast(DRAW_EVENT, {imageMap: lastImageMap});
		};

		config.onDraw = function ($scope, handler) {
			$scope.$on(DRAW_EVENT, function (event, args) {
				handler(args.imageMap);
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
