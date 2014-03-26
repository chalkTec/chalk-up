// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '',

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
			// bower:js
			'app/bower_components/modernizr/modernizr.js',
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/es5-shim/es5-shim.js',
			'app/bower_components/angular/angular.js',
			'app/bower_components/json3/lib/json3.min.js',
			'app/bower_components/angular-ui-router/release/angular-ui-router.js',
			'app/bower_components/lodash/dist/lodash.compat.js',
			'app/bower_components/restangular/dist/restangular.js',
			'app/bower_components/spin.js/spin.js',
			'app/bower_components/angular-spinner/angular-spinner.js',
			'app/bower_components/moment/moment.js',
			'app/bower_components/angular-moment/angular-moment.js',
			'app/bower_components/leaflet-dist/leaflet.js',
			'app/bower_components/jquery-waypoints/waypoints.js',
			'app/bower_components/angulartics/src/angulartics.js',
			'app/bower_components/fastclick/lib/fastclick.js',
			'app/bower_components/jquery.cookie/jquery.cookie.js',
			'app/bower_components/foundation/js/foundation.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/angular-scenario/angular-scenario.js',
			// endbower

			'app/bower_components/moment/lang/de.js',
			'app/bower_components/angulartics/src/angulartics-ga.js',

			'app/scripts/*.js',
			'app/scripts/**/*.js',
			'test/mock/**/*.js',
			'test/spec/**/*.js'
		],

		// list of files / patterns to exclude
		exclude: [
			'app/bower_components/angular-scenario/angular-scenario.js'
		],

		// web server port
		port: 8080,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],


		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};
