'use strict';

describe('Service: routesMapService', function () {

	// load the service's module
	beforeEach(module('routesMap'));

	// instantiate service
	var service, imageMap, scope;
	beforeEach(inject(function (routesMapService, imageMapService, $rootScope) {
		service = routesMapService;
		scope = $rootScope.$new();
		imageMap = imageMapService;
	}));


	describe('updating the plan', function () {
		var plan = {
			"id": 2,
			"img": {
				"widthInPx": 1304,
				"heightInPx": 1393,
				"url": "http://demo.chalkup.de/images/floorPlans/heavens-gate.png"
			}
		};

		it('should update the image map', function () {
			spyOn(imageMap, 'updateImage');
			spyOn(service, 'removeRoutes');

			service.updatePlan(plan);

			expect(imageMap.updateImage).toHaveBeenCalledWith(jasmine.objectContaining({
				width: plan.img.widthInPx,
				height: plan.img.heightInPx,
				url: plan.img.url
			}));
			expect(service.removeRoutes).toHaveBeenCalled();
		});
	});

	var route = {
		"id": 1,
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
	};

	var routes = [
		route,
		{
			"id": 2,
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

	describe('updating the routes', function () {
		it('should update the image map markers', function () {
			spyOn(imageMap, 'updateMarkers');

			service.updateRoutes(routes);

			expect(imageMap.updateMarkers).toHaveBeenCalled();
			// retrieve marker groups argument
			var markers = imageMap.updateMarkers.calls.argsFor(0)[0];

			expect(markers.length).toBe(3);
			expect(markers).toContain(jasmine.objectContaining({
				id: 1,
				x: 2000 * 0.1,
				y: 1393 * 0.2
			}));
			expect(markers).toContain(jasmine.objectContaining({
				id: 2,
				x: 2000 * 0.3,
				y: 1393 * 0.4
			}));
			expect(markers).toContain(jasmine.objectContaining({
				id: 3,
				x: 2000 * 0.5,
				y: 1393 * 0.6
			}));
		});
	});

	describe('selecting a route', function () {
		beforeEach(function () {
			service.updateRoutes([route]);
		});

		it('should select the corresponding image marker', function () {
			spyOn(imageMap, 'select');

			service.select(route);

			expect(imageMap.select).toHaveBeenCalledWith(jasmine.objectContaining({
				id: route.id
			}));
		});
	});


	describe('clearing the route selection', function () {
		beforeEach(function () {
			service.updateRoutes([route]);
			service.select(route);
		});

		it('should clear the marker selection', function () {
			spyOn(imageMap, 'clearSelection');

			service.clearSelection();

			expect(imageMap.clearSelection).toHaveBeenCalled();
		});
	});


	describe('selecting an image marker', function () {
		beforeEach(function () {
			service.updateRoutes([route]);
		});

		it('should select the corresponding route', function () {
			var handler = jasmine.createSpy('routeSelectionHandler');
			service.onSelectionChange(scope, handler);

			var marker = { id: route.id };
			imageMap.select(marker);

			expect(handler).toHaveBeenCalledWith(route);
		});
	});

	describe('clearing the image marker selection', function () {
		beforeEach(function () {
			service.updateRoutes([route]);
			service.select(route);
		});

		it('should unselect the selected boulder', function () {
			var handler = jasmine.createSpy('routeSelectionHandler');
			service.onSelectionChange(scope, handler);

			imageMap.clearSelection();

			expect(handler).toHaveBeenCalledWith(undefined);
		});
	});

});
