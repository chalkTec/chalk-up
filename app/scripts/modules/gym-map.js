'use strict';

angular.module('gymMap', ['imageMap']);


angular.module('gymMap')
	.factory('gymMapService', function (imageMapService) {
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

		function markerForBoulder(boulder) {
			var l = boulder.location;
			return {
				id: boulder.id,
				x: l.x * l.floorPlan.img.widthInPx,
				y: l.y * l.floorPlan.img.heightInPx
			};
		}

		function markerGroupsForBoulders(boulders) {
			var bouldersGroup = _.groupBy(boulders, function(boulder) {
				return boulder.color.germanName;
			});

			var markersGroup = {};
			_.each(bouldersGroup, function(boulders, color) {
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

		config.updateBoulders = function (boulders) {
			_boulders = boulders;

			var markers = markerGroupsForBoulders(boulders);
			imageMapService.updateMarkerGroups(markers);
		};

		config.getBoulders = function () {
			return _boulders;
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
					gymMapService.updateGym(gym);

					bouldersGet.then(function(boulders) {
						gymMapService.updateBoulders(boulders);
					});
				});
			}
		};
	});
