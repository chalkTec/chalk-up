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
	var imageMap = {
		image: {
			url: 'test.jpg',
			width: '1000',
			height: '500'
		},
		markers: [
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
		]
	};

	it('should call the draw handler when updated or redrawn', function () {
		var updateHandler = jasmine.createSpy('updateHandler');

		service.onDraw(scope, updateHandler);
		service.update(imageMap);
		service.redraw();

		expect(updateHandler.calls.count()).toBe(2);
		expect(updateHandler).toHaveBeenCalledWith(imageMap);
	});

});
