'use strict';

angular.module('routesMap', ['imageMap', 'cuColor']);

angular.module('routesMap')
	.constant('GRADIENT_ANGLE', 45);

angular.module('routesMap')
	.factory('routesMapService', function ($rootScope, imageMapService, cuColorService, GRADIENT_ANGLE) {
		var config = {};

		// PLAN

		var PLAN_UPDATE_EVENT = 'routesMap:planUpdate';

		// the currently displayed plan
		var _plan;


		config.updatePlan = function (plan) {
			// updating plan implicitly removes routes
			config.removeRoutes();

			_plan = plan;

			var image = {
				width: plan.img.widthInPx,
				height: plan.img.heightInPx,
				url: plan.img.url
			};
			imageMapService.updateImage(image);

			$rootScope.$broadcast(PLAN_UPDATE_EVENT, {plan: plan});
		};

		config.onPlanUpdate = function ($scope, handler) {
			$scope.$on(PLAN_UPDATE_EVENT, function (event, args) {
				handler(args.plan);
			});
		};

		config.getPlan = function () {
			return _plan;
		};


		// ROUTES

		L.RouteIcon = L.DivIcon.extend({
			options: {
				className: 'route-icon',
				iconSize: undefined,    // set with CSS (assignment to undefined is required!)
				iconAnchor: undefined,   // set with CSS (assignment to undefined is required!)
				color: { primary: 'black' }
			},
			createIcon: function (oldIcon) {
				var div = L.DivIcon.prototype.createIcon.call(this, oldIcon);
				var color = this.options.color;

				var css = cuColorService.getCss(color, GRADIENT_ANGLE);
				$(div).css(css);
				return div;
			}
		});

		L.routeIcon = function (color) {
			return new L.RouteIcon({color: color});
		};

		function createMarkerForRoute(route) {
			var l = route.location;
			return {
				id: route.id,
				x: l.x * l.floorPlan.img.widthInPx,
				y: l.y * l.floorPlan.img.heightInPx,
				icon: L.routeIcon(route.color)
			};
		}

		// the currently displayed routes
		var _routes;

		config.removeRoutes = function () {
			_routes = undefined;

			imageMapService.removeMarkers();
		};


		var routesForMarkers;
		var markersForRoutes;

		function routeForMarker(marker) {
			return routesForMarkers[marker.id];
		}
		function markerForRoute(route) {
			return markersForRoutes[route.id];
		}

		config.updateRoutes = function (routes) {
			_routes = routes;

			var markers = _.map(routes, createMarkerForRoute);
			imageMapService.updateMarkers(markers);

			routesForMarkers = _.indexBy(routes, 'id');
			markersForRoutes = _.indexBy(markers, 'id');
		};

		config.updateRoute = function(route) {
			// update marker for route
			var marker = markerForRoute(route);
			var newMarker = createMarkerForRoute(route);
			_.assign(marker, newMarker);

			imageMapService.updateMarker(marker);
		};

		imageMapService.onSelectionChange($rootScope, function (marker) {
			if (_.isUndefined(marker)) {
				config.select(undefined);
			}
			else {
				var route = routeForMarker(marker);
				config.select(route);
			}
		});

		config.getRoutes = function () {
			return _routes;
		};


		// MOVABLE ROUTES

		imageMapService.onMarkerMoved($rootScope, function(marker) {
			var route = routeForMarker(marker);
			var l = route.location;
			l.x = marker.x / l.floorPlan.img.widthInPx;
			l.y = marker.y / l.floorPlan.img.heightInPx;
		});


		// SELECTED ROUTE

		var SELECTION_EVENT = 'routesMap:select';

		var _selectedRoute;

		config.moveRouteStart = function(route) {
			imageMapService.disableSelection();
			imageMapService.setMarkerMovable(markerForRoute(route), true);
		};

		config.moveRouteEnd = function(route) {
			imageMapService.enableSelection();
			imageMapService.setMarkerMovable(markerForRoute(route), false);
		};

		config.clearSelection = function () {
			config.select(undefined);
		};

		config.select = function (route) {
			if(route === _selectedRoute) {
				return;
			}

			_selectedRoute = route;

			if(_.isUndefined(route)) {
				imageMapService.clearSelection();
			}
			else {
				imageMapService.select(markerForRoute(route));
			}
			$rootScope.$broadcast(SELECTION_EVENT, {route: _selectedRoute});
		};

		/* installs a handler that is called when the selection changes (to another route or to undefined) */
		config.onSelectionChange = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
				handler(args.route);
			});
		};

		config.hasSelected = function () {
			return !_.isUndefined(config.getSelected());
		};

		config.getSelected = function () {
			return _selectedRoute;
		};

		return config;

	});


angular.module('routesMap')
	.directive('routesMap', function () {
		return {
			restrict: 'A',
			template: '<div image-map></div>',
			replace: true
		};
	});
