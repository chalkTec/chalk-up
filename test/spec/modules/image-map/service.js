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

	var imageUpdateHandler, markersUpdateHandler, selectionUpdateHandler;
	beforeEach(inject(function () {
		imageUpdateHandler = jasmine.createSpy('imageUpdateHandler');
		markersUpdateHandler = jasmine.createSpy('markersUpdateHandler');
		selectionUpdateHandler = jasmine.createSpy('selectionUpdateHandler');

		service.onImageUpdate(scope, imageUpdateHandler);
		service.onMarkerGroupsUpdate(scope, markersUpdateHandler);
		service.onSelect(scope, selectionUpdateHandler);
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

	it('should call the image and markers update handler when image is updated', function () {
		service.updateImage(image);

		expect(imageUpdateHandler).toHaveBeenCalledWith(image);
		expect(markersUpdateHandler).toHaveBeenCalledWith(undefined);

		expect(service.getImage()).toBe(image);
		expect(service.getMarkerGroups()).toBe(undefined);
	});

	it('should call the markers and selection update handler when markers are updated', function () {
		service.updateMarkerGroups(markers);

		expect(markersUpdateHandler).toHaveBeenCalledWith(markers);
		expect(selectionUpdateHandler).toHaveBeenCalledWith(undefined);

		expect(service.getMarkerGroups()).toBe(markers);
		expect(service.getSelected()).toBe(undefined);
	});

	it('should call the update selection handler when selection is updated', function () {
		service.select(markers[0]);

		expect(selectionUpdateHandler).toHaveBeenCalledWith(markers[0]);

		expect(service.hasSelected()).toBeTruthy();
		expect(service.getSelected()).toBe(markers[0]);
	});
});
