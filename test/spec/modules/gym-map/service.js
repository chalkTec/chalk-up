'use strict';

describe('Service: gymMapService', function () {

	// load the service's module
	beforeEach(module('gymMap'));

	// instantiate service
	var service, scope;
	beforeEach(inject(function (gymMapService, $rootScope) {
		service = gymMapService;
		scope = $rootScope.$new();
	}));


	var boulders = [
		{
			"id": 1,
			"color": {
				"name": "BLUE",
				"germanName": "blau",
				"englishName": "blue",
				"primary": "rgb(61, 61, 255)"
			},
			"location": {
				"floorPlan": {
					"id": 1,
					"img": {
						"widthInPx": 2000,
						"heightInPx": 1393,
						"url": "http://demo.chalkup.de/images/floorPlans/boulderwelt-muenchen.jpg"
					}
				},
				"x": 0.1,
				"y": 0.2
			}
		},
		{
			"id": 2,
			"color": {
				"name": "BLUE",
				"germanName": "blau",
				"englishName": "blue",
				"primary": "rgb(61, 61, 255)"
			},
			"location": {
				"floorPlan": {
					"id": 1,
					"img": {
						"widthInPx": 2000,
						"heightInPx": 1393,
						"url": "http://demo.chalkup.de/images/floorPlans/boulderwelt-muenchen.jpg"
					}
				},
				"x": 0.3,
				"y": 0.4
			}
		},
		{
			"id": 3,
			"color": {
				"name": "RED",
				"germanName": "rot",
				"englishName": "red",
				"primary": "rgb(255, 0, 0)"
			},
			"location": {
				"floorPlan": {
					"id": 1,
					"img": {
						"widthInPx": 2000,
						"heightInPx": 1393,
						"url": "http://demo.chalkup.de/images/floorPlans/boulderwelt-muenchen.jpg"
					}
				},
				"x": 0.5,
				"y": 0.6
			}
		}
	];

	xit('should transform a list of boulders into groups of markers', function () {
		var markerGroups = service.markerGroupsForBoulders(boulders);

		expect(_.keys(markerGroups)).toContain('rot');
		expect(_.keys(markerGroups)).toContain('blau');

		expect(markerGroups['rot'].length).toBe(1);
		expect(markerGroups['rot'][0]).toEqual(jasmine.objectContaining({
			id: 3,
			x: 2000 * 0.5,
			y: 1393 * 0.6
		}));

		expect(markerGroups['blau'].length).toBe(2);
		expect(markerGroups['blau']).toContain(jasmine.objectContaining({
			id: 1,
			x: 2000 * 0.1,
			y: 1393 * 0.2
		}));
		expect(markerGroups['blau']).toContain(jasmine.objectContaining({
			id: 2,
			x: 2000 * 0.3,
			y: 1393 * 0.4
		}));
	});

});
