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

	var imageUpdateHandler, markersUpdateHandler, selectionChangeHandler, unselectionHandler;
	beforeEach(function () {
		imageUpdateHandler = jasmine.createSpy('imageUpdateHandler');
		markersUpdateHandler = jasmine.createSpy('markersUpdateHandler');
		selectionChangeHandler = jasmine.createSpy('selectionChangeHandler');
		unselectionHandler = jasmine.createSpy('unselectionHandler');

		service.onImageUpdate(scope, imageUpdateHandler);
		service.onMarkersUpdate(scope, markersUpdateHandler);
		service.onSelectionChange(scope, selectionChangeHandler);
		service.onUnselect(scope, unselectionHandler);
	});

	var image = {
		url: 'test.jpg',
		width: '1000',
		height: '500'
	};

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
		expect(service.getMarkers()).toBe(undefined);
	});

	it('should call the markers and selection update handler when markers are updated', function () {
		service.updateMarkers(markers);

		expect(markersUpdateHandler).toHaveBeenCalledWith(markers);
		expect(selectionChangeHandler).toHaveBeenCalledWith(undefined);
		expect(unselectionHandler).not.toHaveBeenCalled();

		expect(service.getMarkers()).toBe(markers);
		expect(service.getSelected()).toBe(undefined);
	});

	it('should call the update selection handler when selection is updated', function () {
		expect(service.hasSelected()).toBeFalsy();
		expect(service.getSelected()).toBe(undefined);

		service.select(markers[0]);

		expect(selectionChangeHandler).toHaveBeenCalledWith(markers[0]);
		expect(unselectionHandler).not.toHaveBeenCalled();
		expect(service.hasSelected()).toBeTruthy();
		expect(service.getSelected()).toBe(markers[0]);
		selectionChangeHandler.calls.reset();
		unselectionHandler.calls.reset();

		service.select(markers[1]);

		expect(selectionChangeHandler).toHaveBeenCalledWith(markers[1]);
		expect(unselectionHandler).toHaveBeenCalledWith(markers[0]);
		expect(service.hasSelected()).toBeTruthy();
		expect(service.getSelected()).toBe(markers[1]);
		selectionChangeHandler.calls.reset();
		unselectionHandler.calls.reset();

		service.clearSelection();

		expect(selectionChangeHandler).toHaveBeenCalledWith(undefined);
		expect(unselectionHandler).toHaveBeenCalledWith(markers[1]);
		expect(service.hasSelected()).toBeFalsy();
		expect(service.getSelected()).toBe(undefined);
	});
});
