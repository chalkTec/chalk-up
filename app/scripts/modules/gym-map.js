'use strict';

angular.module('gymMap', ['imageMap']);


angular.module('gymMap')
	.factory('gymMapService', function () {
		var config = {};

		config.imageForFloorPlan = function(floorPlan) {
			return {
				width: floorPlan.img.widthInPx,
				height: floorPlan.img.heightInPx,
				url: floorPlan.img.url
			};
		};

		config.markerForBoulder = function(boulder) {
			var l = boulder.location;
			return {
				id: boulder.id,
				x: l.x * l.floorPlan.img.widthInPx,
				y: l.y * l.floorPlan.img.heightInPx
			};
		};

		config.markerGroupsForBoulders = function(boulders) {
			var bouldersGroup = _.groupBy(boulders, function(boulder) {
				return boulder.color.germanName;
			});

			var markersGroup = {};
			_.each(bouldersGroup, function(boulders, color) {
				var markers = _.map(boulders, config.markerForBoulder);
				markersGroup[color] = markers;
			});

			return markersGroup;
		};

		return config;
	});


angular.module('gymMap')
	.directive('gymMap', function ($rootScope, gymMapService, imageMapService, Restangular) {
		return {
			restrict: 'A',
			templateUrl: '/views/gym-map.html',
			scope: {
				gymId: '='
			},
			controller: function ($scope) {

				var gym = Restangular.one('gyms', $scope.gymId);
				var bouldersGet = gym.all('boulders').getList();

				gym.get().then(function(gym) {
					var floorPlan = _.first(gym.floorPlans);
					var image = gymMapService.imageForFloorPlan(floorPlan);
					imageMapService.updateImage(image);

					bouldersGet.then(function(boulders) {
						var markers = gymMapService.markerGroupsForBoulders(boulders);
						imageMapService.updateMarkerGroups(markers);
					});
				});
			}
		};
	});
