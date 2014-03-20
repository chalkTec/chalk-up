'use strict';

describe('Service: imageMapService', function () {

	// load the service's module
	beforeEach(module('imageMap'));

	// instantiate service
	var service, scope;
	beforeEach(inject(function (imageMapService, $rootScope) {
		service = imageMapService;
		scope = $rootScope.$new();
	}));
	var image = {
		url: 'test.jpg',
		width: '1000',
		height: '500'
	};

	var div = angular.element('<div></div>');

	var markers = [
		{
			id: 1,
			icon: {},
			x: 300,
			y: 499
		},
		{
			id: 2,
			icon: {},
			x: 700,
			y: 150
		}
	];

	it('should call the image update handler when updated or redrawn', function () {
		var handler = jasmine.createSpy('imageUpdateHandler');

		service.onImageUpdate(scope, handler);
		service.updateImage(image);

		expect(handler).toHaveBeenCalledWith(image);

		expect(service.getImage()).toBe(image);
	});

	it('should call the markers update handler when updated or redrawn', function () {
		var handler = jasmine.createSpy('markersUpdateHandler');

		service.onMarkersUpdate(scope, handler);
		service.updateMarkers(markers);

		expect(handler).toHaveBeenCalledWith(markers);
		expect(service.getMarkers()).toBe(markers);
	});

	it('should call the update selection handler when marker selection occurs', function () {
		var handler = jasmine.createSpy('updateSelectionHandler');

		service.onSelect(scope, handler);
		service.select(markers[0]);

		expect(handler).toHaveBeenCalledWith(markers[0]);
	});
});
