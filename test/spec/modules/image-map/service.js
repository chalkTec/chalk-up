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

	it('should call the draw handler when updated or redrawn', function () {
		var updateHandler = jasmine.createSpy('imageUpdateHandler');

		service.onImageUpdate(scope, updateHandler);
		service.updateImage(image);

		expect(updateHandler).toHaveBeenCalledWith(image);
	});

	it('should call the update selection handler when marker selection occurs', function () {
		var updateSelectionHandler = jasmine.createSpy('updateSelectionHandler');

		service.onSelect(scope, updateSelectionHandler);
		service.select(markers[0]);

		expect(updateSelectionHandler).toHaveBeenCalledWith(markers[0]);
	});
});
