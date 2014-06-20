'use strict';

angular.module('chalkUpApp')
	.controller('StatisticsCtrl', function ($scope, routes) {
		var buckets = {
			limits: {
				'2': [0.000, 0.032],
				'3': [0.032, 0.130],
				'4': [0.130, 0.226],
				'5': [0.226, 0.323],
				'6': [0.323, 0.420],
				'7': [0.420, 0.517],
				'8': [0.517, 0.613],
				'9': [0.613, 0.710],
				'10': [0.710, 0.807],
				'11': [0.807, 0.904],
				'12': [0.904, 1.000]
			},
			forGrade: function(grade) {
				return _(this.limits).findKey(function(range) {
					return range[0] <= grade.value && grade.value < range[1];
				});
			}
		};

		var routeBuckets = {};

		_(routes).each(function(route) {
			var bucket = buckets.forGrade(route.initialGrade);
			if(!_(routeBuckets).has(bucket)) {
				routeBuckets[bucket] = 0;
			}
			routeBuckets[bucket]++;
		});

		var data = _(routeBuckets).pairs().map(function(e) {
			return [parseInt(e[0]), e[1]];
		}).valueOf();

		$scope.myData = [{data: data, valueLabels: {
			show: true,
			showAsHtml: true,
			align: 'center'
		}}];

		$scope.myChartOptions = {
			xaxis: {
				ticks: _(buckets.limits).keys().map(function(e) {return parseInt(e);}).valueOf(),
				tickDecimals: 0,
				tickLength: 0,
				font: {
					size: 16,
					weight: 'bold',
					family: 'Open Sans',
					color: '#222222'
				}
			},
			yaxis: {
				show: false
			},
			bars: {
				show: true,
				barWidth: 0.35,
				align: 'center',
				lineWidth: 0,
				fillColor: 'rgb(221, 221, 51)'
			},
			grid: {
				borderWidth: 0,
				labelMargin: 10,
				margin: {
					left: 10,
					right: 15,
					bottom: 10
				}
			}
		};
	});