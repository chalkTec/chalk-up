'use strict';

angular.module('imageMap', []);

angular.module('imageMap')
	.config(function () {
		L.Icon.Default.imagePath = '/bower_components/leaflet-dist/images';
	});

angular.module('imageMap')
	.constant('imageMapPadding', 10);


angular.module('imageMap')
	.factory('imageMapService', function ($rootScope) {
		var config = {};

		// IMAGE

		var IMAGE_UPDATE_EVENT = 'imageMap:imageUpdate';

		// the currently displayed image
		var _image;

		config.updateImage = function (image) {
			// updating image implicitly removes markers
			config.removeMarkers();

			_image = image;
			$rootScope.$broadcast(IMAGE_UPDATE_EVENT, {image: _image});
		};

		config.onImageUpdate = function ($scope, handler) {
			$scope.$on(IMAGE_UPDATE_EVENT, function (event, args) {
				handler(args.image);
			});
		};

		config.getImage = function () {
			return _image;
		};

		// MARKERS

		var MARKERS_EVENT = 'imageMap:markers';

		// the currently active markers
		var _markers;

		config.removeMarkers = function () {
			config.updateMarkers(undefined);
		};

		config.updateMarkers = function (markers) {
			// updating markers implicitly clears selection
			config.clearSelection();

			_markers = markers;
			$rootScope.$broadcast(MARKERS_EVENT, {markers: markers});
		};

		config.onMarkersUpdate = function ($scope, handler) {
			$scope.$on(MARKERS_EVENT, function (event, args) {
				handler(args.markers);
			});
		};

		config.getMarkers = function () {
			return _markers;
		};


		var MARKER_UPDATE_EVENT = 'imageMap:markerUpdate';

		config.updateMarker = function(marker) {
			$rootScope.$broadcast(MARKER_UPDATE_EVENT, {marker: marker});
		};

		config.onMarkerUpdate = function ($scope, handler) {
			$scope.$on(MARKER_UPDATE_EVENT, function (event, args) {
				handler(args.marker);
			});
		};


		// DRAGGABLE

		var MARKER_MOVABLE_EVENT = 'imageMap:markerMovable';

		config.setMarkerMovable = function (marker, movable) {
			$rootScope.$broadcast(MARKER_MOVABLE_EVENT, {marker: marker, movable: movable});
		};

		config.onMarkerMovableChange = function ($scope, handler) {
			$scope.$on(MARKER_MOVABLE_EVENT, function (event, args) {
				handler(args.marker, args.movable);
			});
		};

		var MARKER_MOVED_EVENT = 'imageMap:markerMoved';

		config.markerMoved = function(marker) {
			$rootScope.$broadcast(MARKER_MOVED_EVENT, {marker: marker});
		};

		config.onMarkerMoved = function ($scope, handler) {
			$scope.$on(MARKER_MOVED_EVENT, function (event, args) {
				handler(args.marker);
			});
		};


		// SELECTION ENABLED

		var SELECTION_ENABLED_CHANGE_EVENT = 'imageMap:selectionEnabledChange';

		var _selectionEnabled = true;

		config.isSelectionEnabled = function () {
			return _selectionEnabled;
		};

		config.enableSelection = function () {
			_selectionEnabled = true;
			$rootScope.$broadcast(SELECTION_ENABLED_CHANGE_EVENT, {selectionEnabled: true});
		};

		config.disableSelection = function () {
			_selectionEnabled = false;
			$rootScope.$broadcast(SELECTION_ENABLED_CHANGE_EVENT, {selectionEnabled: false});
		};


		config.onSelectionEnabledChange = function ($scope, handler) {
			$scope.$on(SELECTION_ENABLED_CHANGE_EVENT, function (event, args) {
				handler(args.selectionEnabled);
			});
		};


		// SELECTED MARKER

		var SELECTION_EVENT = 'imageMap:select';
		var UNSELECTION_EVENT = 'imageMap:unselect';

		var _selectedMarker;

		config.clearSelection = function () {
			internalSelect(undefined);
		};

		function internalSelect(marker) {
			var previousSelected = _selectedMarker;
			_selectedMarker = marker;
			if (!_.isUndefined(previousSelected)) {
				$rootScope.$broadcast(UNSELECTION_EVENT, {marker: previousSelected});
			}

			$rootScope.$broadcast(SELECTION_EVENT, {marker: _selectedMarker});
		}

		config.select = function (marker) {
			internalSelect(marker);
		};

		/* installs a handler that is called when the selection changes (to another marker or to undefined) */
		config.onSelectionChange = function ($scope, handler) {
			$scope.$on(SELECTION_EVENT, function (event, args) {
				handler(args.marker);
			});
		};

		/* installs a handler that is called when a marker is unselected */
		config.onUnselect = function ($scope, handler) {
			$scope.$on(UNSELECTION_EVENT, function (event, args) {
				handler(args.marker);
			});
		};

		config.hasSelected = function () {
			return !_.isUndefined(config.getSelected());
		};

		config.getSelected = function () {
			return _selectedMarker;
		};


		return config;
	});


angular.module('imageMap')
	.factory('leafletMap', function ($rootScope, imageMapPadding) {
		var setZoomClass = function (map) {
			var $container = $(map.getContainer());
			for (var i = 0; i < 15; i++) {
				$container.removeClass('zoom-' + i);
			}

			$container.addClass('zoom-' + map.getZoom());
		};

		var clickHandlers = [];

		var config = {};

		config.map = undefined;

		config.init = function (element) {
			// SETUP MAP
			config.map = L.map(element, {
				maxZoom: 3,
				crs: L.CRS.Simple,
				attributionControl: false,
				zoomControl: true
			});
			config.map.setView([0, 0], 0);

			config.map.on('click', function () {
				$rootScope.$apply(function() {
					_.each(clickHandlers, function(clickHandler) {
						clickHandler();
					});
				});
			});


			// ZOOM CSS CLASS

			setZoomClass(config.map);
			config.map.on('zoomend', function () {
				$rootScope.$apply(function () {
					setZoomClass(config.map);
				});
			});
		};

		config.destroy = function () {
			config.map.remove();
			config.map = undefined;
			clickHandlers = [];
		};

		config.onResize = function (handler) {
			config.map.on('resize', function () {
				$rootScope.$apply(handler);
			});
		};

		config.onClick = function (handler) {
			clickHandlers.push(handler);
		};

		config.offClick = function(handler) {
			_.pull(clickHandlers, handler);
		};


		config.resetView = function () {
			config.map.setView([0, 0], 0, { reset: true });
			setZoomClass(config.map);
		};

		config.calculateProjection = function (rectangle) {
			var map = config.map;
			var containerWidth = map.getSize().x - imageMapPadding * 2;
			var containerHeight = map.getSize().y - imageMapPadding * 2;
			var containerAspectRatio = containerHeight / containerWidth;

			var imageAspectRatio = rectangle.height / rectangle.width;

			var resultingWidth, resultingHeight, xOffset, yOffset;
			if (containerAspectRatio >= imageAspectRatio) {
				// image plan is wider, => fit to containerWidth
				resultingWidth = containerWidth;
				resultingHeight = rectangle.height * containerWidth / rectangle.width;
				xOffset = imageMapPadding;
				yOffset = (containerHeight - resultingHeight) / 2 + imageMapPadding;
			}
			else {
				// image plan is higher, => fit to containerHeight
				resultingWidth = rectangle.width * containerHeight / rectangle.height;
				resultingHeight = containerHeight;
				xOffset = (containerWidth - resultingWidth) / 2 + imageMapPadding;
				yOffset = imageMapPadding;
			}

			var southWestCorner = map.containerPointToLatLng([xOffset, resultingHeight + yOffset]);
			var northEastCorner = map.containerPointToLatLng([xOffset + resultingWidth, yOffset]);

			var scaleFactor = rectangle.width / resultingWidth;

			return {
				latLngBounds: L.latLngBounds(southWestCorner, northEastCorner),
				latLngToImagePoint: function (latLng) {
					return map.project(L.latLng(latLng), 0).add([resultingWidth / 2, resultingHeight / 2]).multiplyBy(scaleFactor);
				},
				imagePointToLatLng: function (point) {
					return map.unproject(L.point(point).divideBy(scaleFactor).subtract([resultingWidth / 2, resultingHeight / 2]), 0);
				}
			};
		};

		return config;

	});


angular.module('imageMap')
	.factory('mapOverlay', function (leafletMap) {
		var config = {};

		var overlay;

		config.projection = undefined;

		function removeOverlay() {
			if (!_.isUndefined(overlay)) {
				leafletMap.map.removeLayer(overlay);
				overlay = undefined;
				config.projection = undefined;
				leafletMap.map.setMaxBounds(undefined);
			}
		}

		function addOverlay(image) {
			config.projection = leafletMap.calculateProjection(image);

			// add new overlay
			overlay = L.imageOverlay(image.url, config.projection.latLngBounds, {
				noWrap: true
			});
			overlay.addTo(leafletMap.map);
			leafletMap.map.setMaxBounds(config.projection.latLngBounds);
		}

		config.drawImageOverlay = function (image) {
			if (_.isUndefined(image)) {
				removeOverlay();
				return;
			}

			// remove old overlay
			removeOverlay();

			addOverlay(image);
		};

		config.destroy = function () {
			removeOverlay();
		};

		return config;
	});


angular.module('imageMap')
	.factory('mapMarkers', function ($rootScope, leafletMap, mapOverlay) {
		var MyMarker = L.Marker.extend({
			onAdd: function (map) {
				L.Marker.prototype.onAdd.call(this, map);
				if (this.options.selected) {
					$(this._icon).addClass('selected');
				}
			},
			redraw: function () {
				var map = this._map;
				if (map) {
					map.removeLayer(this);
					map.addLayer(this);
				}
			}
		});

		var myMarker = function (latLng, options) {
			return new MyMarker(latLng, options);
		};

		var config = {};

		var markerIdToLeafletMarker;

		var leafletMarkers;

		var getLeafletMarker = function (imageMapMarker) {
			return markerIdToLeafletMarker[imageMapMarker.id];
		};

		function removeMarkers() {
			if (!_.isUndefined(leafletMarkers)) {
				_.each(leafletMarkers, function (marker) {
					leafletMap.map.removeLayer(marker);
				});

				leafletMarkers = undefined;
				markerIdToLeafletMarker = undefined;
			}
		}

		function imageMapMarkerToLeafletMarker(imageMapMarker, clickHandler) {
			var latLng = mapOverlay.projection.imagePointToLatLng([imageMapMarker.x, imageMapMarker.y]);
			var options = {
				riseOnHover: true
			};
			if (imageMapMarker.icon) {
				options.icon = imageMapMarker.icon;
			}

			var clickable = !_.isUndefined(clickHandler);
			options.clickable = clickable;

			var marker = myMarker(latLng, options);

			if (clickable) {
				marker.on('click', function () {
					$rootScope.$apply(function () {
						clickHandler(imageMapMarker);
					});
				});
			}

			return marker;
		}

		function addMarkers(markers, clickHandler) {
			markerIdToLeafletMarker = {};
			leafletMarkers = [];
			_.each(markers, function (marker) {
				var leafletMarker = imageMapMarkerToLeafletMarker(marker, clickHandler);
				leafletMarkers.push(leafletMarker);
				leafletMarker.addTo(leafletMap.map);
				markerIdToLeafletMarker[marker.id] = leafletMarker;
				return leafletMarker;
			});
		}

		config.drawMarkers = function (markers, clickHandler) {
			if (_.isUndefined(markers)) {
				removeMarkers();
				return;
			}

			// remove old markers
			removeMarkers();

			addMarkers(markers, clickHandler);
		};

		config.unmarkSelected = function (marker) {
			var leafletMarker = getLeafletMarker(marker);
			leafletMarker.options.selected = false;
			leafletMarker.redraw();
		};

		config.markSelected = function (marker) {
			var leafletMarker = getLeafletMarker(marker);
			leafletMarker.options.selected = true;
			leafletMarker.redraw();
		};

		config.panTo = function (marker) {
			var leafletMarker = getLeafletMarker(marker);
			// animate true does not work properly:
			// - little movements even when zoomed out entirely
			// - animated panning to a point and then zooming out does not take max bounds into account
			leafletMap.map.panTo(leafletMarker.getLatLng());
		};

		config.destroy = function () {
			removeMarkers();
		};

		config.removeMarkersClickHandlers = function () {
			_.each(leafletMarkers, function (leafletMarker) {
				leafletMarker.options.clickable = false;
				leafletMarker.off('click');
				leafletMarker.redraw();
			});
		};

		config.setMarkerMovable = function (marker, moveHandler) {
			var leafletMarker = getLeafletMarker(marker);
			// marker needs to be clickable in order to be draggable
			leafletMarker.options.clickable = true;
			leafletMarker.options.draggable = true;
			leafletMarker.redraw();
			leafletMarker.on('dragend', function() {
				$rootScope.$apply(function () {
					var oldPosition = L.point(marker.x, marker.y);
					var newPosition = mapOverlay.projection.latLngToImagePoint(leafletMarker.getLatLng());
					marker.x = newPosition.x;
					marker.y = newPosition.y;
					if(!_.isUndefined(moveHandler)) {
						moveHandler(marker, newPosition, oldPosition);
					}
				});
			});
		};

		config.setMarkerUnmovable = function (marker) {
			var leafletMarker = getLeafletMarker(marker);
			leafletMarker.options.clickable = leafletMarker.hasEventListeners('click');
			leafletMarker.options.draggable = false;
			leafletMarker.redraw();
			leafletMarker.off('dragend');
		};

		config.redraw = function(marker) {
			var leafletMarker = getLeafletMarker(marker);
			// TODO: implement proper redraw
			var latLng = mapOverlay.projection.imagePointToLatLng([marker.x, marker.y]);
			leafletMarker.setLatLng(latLng);
			leafletMarker.options.icon = marker.icon;
			leafletMarker.redraw();
		};

		return config;
	});


angular.module('imageMap')
	.directive('imageMap', function ($rootScope, imageMapService) {

		return {
			restrict: 'A',
			scope: {},
			controller: function ($scope, $element, leafletMap, mapOverlay, mapMarkers) {
				// SETUP MAP
				leafletMap.init($element[0]);


				// IMAGE OVERLAY
				mapOverlay.drawImageOverlay(imageMapService.getImage());

				imageMapService.onImageUpdate($scope, function (img) {
					mapOverlay.drawImageOverlay(img);
				});


				var selectionClickHandler = function (marker) {
					imageMapService.select(marker);
				};

				// MARKERS
				mapMarkers.drawMarkers(imageMapService.getMarkers(), imageMapService.isSelectionEnabled() ? selectionClickHandler : undefined);

				imageMapService.onMarkersUpdate($scope, function (markers) {
					mapMarkers.drawMarkers(markers,  imageMapService.isSelectionEnabled() ? selectionClickHandler : undefined);
				});



				// SELECTOR	(the map is able to select a marker)

				if (imageMapService.isSelectionEnabled()) {
					leafletMap.onClick(imageMapService.clearSelection);
				}

				imageMapService.onSelectionEnabledChange($scope, function (selectionEnabled) {
					if(selectionEnabled) {
						leafletMap.onClick(imageMapService.clearSelection);
						mapMarkers.drawMarkers(imageMapService.getMarkers(), selectionClickHandler);
						mapMarkers.markSelected(imageMapService.getSelected());
					}
					else {
						leafletMap.offClick(imageMapService.clearSelection);
						mapMarkers.removeMarkersClickHandlers();
					}
				});


				// SELECTION INDICATION (a selection of a marker is displayed on the map)

				if (imageMapService.hasSelected()) {
					mapMarkers.markSelected(imageMapService.getSelected());
				}
				imageMapService.onSelectionChange($scope, function (marker) {
					if (!_.isUndefined(marker)) {
						mapMarkers.markSelected(marker);
						mapMarkers.panTo(marker);
					}
				});
				imageMapService.onUnselect($scope, function (marker) {
					mapMarkers.unmarkSelected(marker);
				});

				// MARKER UPDATE
				imageMapService.onMarkerUpdate($scope, function(marker) {
					mapMarkers.redraw(marker);
					if(imageMapService.getSelected() === marker) {
						mapMarkers.markSelected(marker);
					}
				});


				// MARKER MOVING

				var moveHandler = function(marker) {
					imageMapService.markerMoved(marker);
				};

				imageMapService.onMarkerMovableChange($scope, function (marker, movable) {
					if(movable) {
						mapMarkers.setMarkerMovable(marker, moveHandler);
					}
					else {
						mapMarkers.setMarkerUnmovable(marker);
					}
				});


				// RESIZE MAP
				leafletMap.onResize(function () {
					leafletMap.resetView();

					mapOverlay.drawImageOverlay(imageMapService.getImage());
					mapMarkers.drawMarkers(imageMapService.getMarkers(), imageMapService.isSelectionEnabled() ? selectionClickHandler : undefined);
					if (imageMapService.hasSelected()) {
						mapMarkers.markSelected(imageMapService.getSelected());
					}
				});


				// DESTROY
				$scope.$on('$destroy', function () {
					mapMarkers.destroy();
					mapOverlay.destroy();
					leafletMap.destroy();
				});
			}
		};
	});
