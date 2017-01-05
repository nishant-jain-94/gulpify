const args = require('yargs').argv;
const gulp = require('gulp');
const glob = require('glob-all');
const stylish = require('jshint-stylish');
const port = process.env.PORT;
const plugins = require('gulp-load-plugins')();
const wiredep = require('wiredep').stream;
const LessAutoPrefix = require('less-plugin-autoprefix');
const del = require('del');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatOut = bformat({ outputMode: 'short' });
const log =  bunyan.createLogger({ name: 'gulpify', stream: formatOut });

// const nodemon = require('gulp-nodemon');

var src = './src/' 
var temp = './.tmp/';
var client = src + 'client/';
var server = src + 'server/'
var config = {
	 temp: temp,
	 js: src + '**/*.js',
	 build: './build/',
	 report: './report/',
	 client: {
	 	'js': client + 'js/*.js',
	 	'css': client + 'css/*.css',
	 	'less': client + 'styles/*.less'
	 },
	 plato: {
	 	files: './src/**/*.js',
	 	outputDir: './report',
	 	options: {
	 		title: 'Code Analyzer using Plato'
	 	}
	 },
	 nodemon: {
	 	options: {
	 		script: server + 'app.js',	
	 		env: {
	 			'NODE_ENV': 'dev',
	 			'PORT': 7000
	 		}
	 	}
	 }
};


/**
 * List all the gulp tasks
 */
gulp.task('help', plugins.taskListing);
gulp.task('default', ['help']);

/**
 * Analyze and Lints all the JS files 	
 */
gulp.task('lint', ['plato'], function() {
	log.info('Analyze the code using JSHint');

	return gulp
			.src(config.js)
			.pipe(plugins.jshint())
			.pipe(plugins.jshint.reporter(stylish));
});

/**
 * Analyze code using Plato
 */
gulp.task('plato', function(done) {
	log.info('Analyze the code using plato');
	log.info('Browser for the reports in /report/plato/index.html to see Plato results');

	var plato = require('plato');
	var files = glob.sync(config.plato.files);
	plato.inspect(files, config.plato.outputDir, config.plato.options, platoCompleted);

	function platoCompleted(report) {
		var overview = plato.getOverviewReport(report);
		if(args.verbose) {
			log.info(overview.summary);
		}
		done();
	};
});

/**
 * Serve the code using nodemon, 
 * which also watches for the file change
 */

gulp.task('serve', ['lint'], function() {
	log.info('Serve the code using nodemon');
	serve(true);
	
});

gulp.task('serve-build', function() {

});

/**
 * Wire Bower Dependencies to the source code.
 * @return {Stream}
 */
gulp.task('wiredep', function() {
	
	return gulp
			.src(config.index)
			.pipe(wiredep({
				directory: 'bower_components',
				bowerJson: 'bower.json'
			}))
			.pipe(gulp.dest('./build'));
});

/**
 * Injecting file references into index.html
 * 
 */
gulp.task('inject', ['wiredep'], function() {
	
	return gulp
			.src(config.index)
			.pipe(plugins.inject([config.client.js, config.client.css]))
			.pipe(gulp.dest(config.client));
});

/**
 * Builds Everything
 */
gulp.task('build', ['optimize'], function() {
	
	log.info('Build Everything');

	var msg = {
		title: 'Gulp Build',
		subtitle: 'Deployed to the build folder'
	};

	log.info(msg);
	notify(msg);
});

/**
 * Optimize all files
 */

gulp.task('optimize', ['inject'], function() {

	return gulp
			.src(config.index)
			.pipe(plugins.useref())
			.pipe(plugins.gulpif('*.css', plugins.minifyCss()))
			.pipe(plugins.gulpif('*.js', plugins.uglify()))
			.pipe(gulp.dest('build'));
});

gulp.task('clean', function(done) {
	var files = [config.build, config.temp, config.report];
	clean(files, done);
});

gulp.task('clean-styles', function(done) {
	var files = [config.temp + '**/*.css', config.build + 'styles/**/*.css']
	clean(files, done);
});

gulp.task('clean-images', function() {
	clean(config.build + 'images/**/*.*', done);
});

gulp.task('clean-fonts', function() {
	clean(config.build + 'fonts/**/*.*', done);
});

gulp.task('clean-code', function() {
	var files = [config.temp]
});

gulp.task('styles', function() {
	log('Compiling less to css');

	return gulp
			.src(config.client.less)
			.pipe(plugins.less())
			.pipe(plugins.autoprefixer({browsers: ['last 2 versions']}))
			.pipe(gulp.dest(config.temp));

});

function serve(isDev, specRunner) {
	var debug = args.debug || args.debugBrk;
	var debugMode = args.debug ? '--debug' : args.debugBrk ? '--debug-brk' : '';
	console.log(debugMode);
	if(debug) {
		log.info('Open the node inspector on localhost:8080/?port=5858');
		config.nodemon.options.nodeArgs = [debugMode];
		runNodeInspector(debugMode);
	}

	if(args.verbose) {
		config.nodemon.options.verbose = true;
	}
	config.nodemon.options.env.NODE_ENV = isDev ? 'dev' : 'build';
	plugins.nodemon(config.nodemon.options)
		.on('start', function() {
			log.info('Starting Node Server on PORT', port);
		})
		.on('restart', function(event) {
            log.info('Restarting script because of '+ event.type + ' in ' + event.path);
		});
};

/**
 * Run the nodeInspector
 * @return {Stream}
 */
function runNodeInspector(debugMode) {
	
	return gulp
		.src([])
		.pipe(plugins.nodeInspector({
			debugPort: 5858,
      		webHost: '0.0.0.0',
      		webPort: 8080,
      		saveLiveEdit: false,
      		preload: true,
      		inject: true,
      		hidden: [],
      		stackTraceLimit: 50,
      		sslKey: '',
			sslCert: ''
		}));
}

/**
 * Logs a string, object or an array
 */
// function log(msg) {
	
// 	if(typeof(msg) === 'object') {
// 		for(var item in msg) {
// 			if(msg.hasOwnProperty(item)) {
// 				plugins.util.log(plugins.util.colors.blue(msg[item]));
// 			}
// 		}
// 	} else {
// 		plugins.util.log(plugins.util.colors.blue(msg));
// 	}
// }

/**
 * Displays system level notifications using node-notifier
 * 
 */
function notify(options) {
	
	var nodeNotifier = require('node-notifier');
	var notifyOptions = {
		sound: 'Bottle',
		contentImage: path.join(__dirname, 'gulp.png'),
		icon: path.join(__dirname, 'gulp.png')
	};
	// assign all the properties in options object to the notifyOptions
	_.assign(notifyOptions, options);
	nodeNotifier.notify(notifyOptions);
};


/**
 * Deletes all the files at the given path
 * @param  {Array}   path  Array of paths to delete
 * @param  {Function} done Callback when complete
 * 
 */
function clean(path, done) {
	log.info('Deleting the following paths');
	log.info(path);

	del(path, done);
};

module.exports = gulp;
