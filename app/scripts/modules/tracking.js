'use strict';


angular.module('tracking', ['angulartics']);

/**
 * @ngdoc overview
 * @name angulartics.google.universal-analytics
 * Enables analytics support for Google Universal Analytics (http://google.com/analytics)
 */
angular.module('tracking')
	.config(['$analyticsProvider', function ($analyticsProvider) {

		// GA already supports buffered invocations so we don't need
		// to wrap these inside angulartics.waitForVendorApi

		$analyticsProvider.settings.trackRelativePath = true;

		$analyticsProvider.registerPageTrack(function (path) {
			if (window.ga) {
				window.ga('send', 'pageview', path);
			}
		});

		/**
		 * Track Event in GA
		 * @name eventTrack
		 *
		 * @param {string} action Required 'action' (string) associated with the event
		 * @param {object} properties Comprised of the mandatory field 'category' (string) and optional fields 'label' (string), 'value' (integer) and field object 'field'
		 *
		 * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/events
		 */
		$analyticsProvider.registerEventTrack(function (action, properties) {
			// GA requires that eventValue be an integer, see:
			// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
			// https://github.com/luisfarzati/angulartics/issues/81
			if (properties.value) {
				var parsed = parseInt(properties.value, 10);
				properties.value = isNaN(parsed) ? 0 : parsed;
			}

			if (window.ga) {
				window.ga('send', 'event', properties.category, action, properties.label, properties.value, properties.field);
			}
		});

	}]);

angular.module('tracking')
	.factory('trackingService', function ($analytics, $state) {
		return {
			gymEvent: function (gymId) {
				var field = {
					dimension1: gymId,
					dimension2: $state.current.name
				};
				return function (category, action, label, value) {
					$analytics.eventTrack(action, { category: category, label: label, value: value, field: field });
				}
			},
			event: function () {
				var field = {
					dimension1: undefined,
					dimension2: $state.current.name
				};
				return function (category, action, label, value) {
					$analytics.eventTrack(action, { category: category, label: label, value: value, field: field });
				}
			}
		};
	});