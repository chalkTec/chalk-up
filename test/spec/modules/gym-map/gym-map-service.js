'use strict';

describe('Service: gymMapService', function () {

	// load the service's module
	beforeEach(module('gymMap'));

	// instantiate service
	var service, imageMap, scope;
	beforeEach(inject(function (gymMapService, imageMapService, $rootScope) {
		service = gymMapService;
		scope = $rootScope.$new();
		imageMap = imageMapService;
	}));


	describe('updating the gym', function() {
		var gym = {
			"id": 2,
			"name": "Heavens Gate",
			"created": "2014-01-01T01:01:01Z",
			"floorPlans": [
				{
					"id": 2,
					"img": {
						"widthInPx": 1304,
						"heightInPx": 1393,
						"url": "http://demo.chalkup.de/images/floorPlans/heavens-gate.png"
					}
				}
			]
		};

		it('should update the image map', function() {
			spyOn(service, 'removeBoulders');
			spyOn(imageMap, 'updateImage');

			service.updateGym(gym);

			var floorPlanImg = gym.floorPlans[0].img;
			expect(imageMap.updateImage).toHaveBeenCalledWith(jasmine.objectContaining({
				width: floorPlanImg.widthInPx,
				height: floorPlanImg.heightInPx,
				url: floorPlanImg.url
			}));
			expect(service.removeBoulders).toHaveBeenCalled();
		});
	});


	describe('updating the boulders', function() {
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

		it('should update the image map markers', function() {
			spyOn(imageMap, 'updateMarkerGroups');

			service.updateBoulders(boulders);

			expect(imageMap.updateMarkerGroups).toHaveBeenCalled();
			// retrieve marker groups argument
			var markerGroups = imageMap.updateMarkerGroups.calls.argsFor(0)[0];

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

});
