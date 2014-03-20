'use strict';

angular.module('imageMap', []);

angular.module('imageMap')
	.factory('imageMapService', function ($rootScope) {
		var config = {};

		var DRAW_EVENT = 'imageMap:draw';

		var lastImageMap = undefined;

		config.update = function (imageMap) {
			lastImageMap = imageMap;
			$rootScope.$broadcast(DRAW_EVENT, {imageMap: imageMap});
		};

		config.redraw = function () {
			$rootScope.$broadcast(DRAW_EVENT, {imageMap: lastImageMap});
		};

		config.onDraw = function($scope, handler) {
			$scope.$on(DRAW_EVENT, function(event, args) {
				handler(args.imageMap);
			});
		};

		return config;
	});
