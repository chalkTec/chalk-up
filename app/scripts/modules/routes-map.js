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

		function markerForRoute(route) {
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


		var routesForMarker;

		function routeForMarker(marker) {
			return routesForMarker[marker.id];
		}

		var onImageMarkerSelectHandler;

		config.updateRoutes = function (routes) {
			_routes = routes;

			var markers = _.map(routes, markerForRoute);
			imageMapService.updateMarkers(markers);

			routesForMarker = _.indexBy(routes, 'id');

			if (!_.isUndefined(onImageMarkerSelectHandler)) {
				// unregister handler
				onImageMarkerSelectHandler();
			}
			onImageMarkerSelectHandler = imageMapService.onSelectionChange($rootScope, function (marker) {
				// internally select the boulder (without propagating it to image map)
				if (_.isUndefined(marker)) {
					internalSelect(undefined);
				}
				else {
					internalSelect(routeForMarker(marker));
				}
			});
		};

		config.getRoutes = function () {
			return _routes;
		};


		// SELECTED ROUTE

		var SELECTION_EVENT = 'routesMap:select';

		var _selectedRoute;

		config.clearSelection = function () {
			imageMapService.clearSelection();

			internalSelect(undefined);
		};

		function internalSelect(route) {
			_selectedRoute = route;
			$rootScope.$broadcast(SELECTION_EVENT, {route: _selectedRoute});
		}

		/* must not be invoked with undefined */
		config.select = function (route) {
			imageMapService.select(markerForRoute(route));

			internalSelect(route);
		};

		/* installs a handler that is called when the selection changes (to another boulder or to undefined) */
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