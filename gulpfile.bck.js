const args=require('yargs').argv;
const gulp = require('gulp');
const path = require('path');
const browserSync = require('browser-sync');
const del = require('del');
// Match files using the patterns the shell uses, like stars and stuff.
const glob = require('glob-all');
const config = require('./gulp.config')();
const eslint = require('gulp-eslint');
const plugins = require('gulp-load-plugins')();
const port = process.env.port || config.defaultPort;
// const forever = require('forever-monitor');

//  Lists the available gulp tasks
gulp.task('help', plugins.taskListing);
gulp.task('default', ['help']);

// Create a visual report
gulp.task('plato', function(done) {
    log('Analyzing source with Plato');
    log('Browse to /report/plato/index.html to see Plato results.');
    startPlatoVisualizer(done);
});

// Vet the code and create coverage report
gulp.task('vet', function() {
    log('Analyzing the source with JSHint and JSCS');
    return gulp
        .src(config.alljs)
        .pipe(plugins.if(args.verbose, plugins.print()))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe(plugins.jshint.reporter('fail'));
});

// Run the spec runner
gulp.task('serve', ['vet', 'plato'], function(done) {
    log('Run the spec runner.');
    serve(true, true);
    done();
});

gulp.task('clean', function(done) {
    var delConfig = [config.tmp, config.build, config. reports];
    log('Cleaning: ' + $.util.colors.blue(delConfig));
    del(delConfig, done);

});

gulp.task('clean-styles', function(done) {
    var files = [].concat(
        config.temp + '**/*.css',
        config.build + 'styles/**/*.css'
        );
    clean(files, done);
});


gulp.task('styles', ['clean-styles'], function() {
    log('Compiling LESS to CSS');

});

/**
 * Compress all the images.
 */

gulp.task('images', ['clean-images'], function() {
    log('Compressing and copying images.');

    return gulp
            .src(config.images)
            .pipe($.imagemin({optimizationLevel: 4}))
            .pipe(gulp.dest(config.build + 'images'));
});

/**
 * Remove all the image from the build folder
 * @param {Function} done Callback when done
 * 
 */
gulp.task('clean-images', function(done) {
    clean(config.build + 'images/**/*.*', done);
});

/**
 * Builds everything 
 */

gulp.task('build', ['optimize', 'images', 'fonts'], function() {
    log('Build everything');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to build folder',
        message: 'Running gulp serve-build'
    };

    del(config.temp);
    log(msg);
    notify(msg);

});

/**
 * Optimize all the files and move them to the build folder
 * and inject them into index.html
 * @return {Stream}
 */
gulp.task('optimize', ['inject', 'test'], function() {
    log('Optimizing the js, css and html');

    var cssFilter = $.filter('**/*.css');
    var jsFilter = $.filter('**/*.js');

    return gulp
            .src(config.index)
            .pipe(plugins.plumber())
            // Gather all assets from the html with useref and concatenate it
            .pipe($.useref()) 
            // Get the css files
            .pipe(cssFilter)
            // Minify the css files
            .pipe($.csso)
            // Restore the filter so as to fetch other files by the next task in the pipeline
            .pipe(cssFilter.restore())
            // Get the custom js files
            .pipe(jsFilter)
            // uglify the js
            .pipe($.uglify)
            // Restore the filter
            .pipe(jsFilter.restore())
            // Pipe it to the destination
            .pipe(gulp.dest(config.build));

});

gulp.task('wiredep', function() {
    log('Wiring the bower dependencies into the html');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();

    return gulp
            .src(config.index)
            .pipe(wiredep(options))
            .pipe(inject(js, '', config.jsOrder))
            .pipe(gulp.dest(config.client))


});

gulp.task('inject', ['wiredep', 'styles'], function() {
    log('Wireup css into html.');

    return gulp
            .src(config.index)
            .pipe(inject(config.css))
            .pipe(gulp.dest(config.client));
});

/**
 * Deletes all the files in the given path.
 * @param {Array} path Array of Paths to delete.
 * @param {done} Function Callback when complete
 */
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function serve(isDev, specRunner) {
    log(args);
    var debug = args.debug || args.debugBrk;
    var debugMode = args.debug ? '--debug' : args.debugBrk ? '--debug-brk' : '';
    var nodeOptions = getNodeOptions(isDev);

    if(debug) {
        log('debug mode');
        runNodeInspector();
        nodeOptions.nodeArgs = [debugMode];
    }

    if(args.verbose) {
        log(nodeOptions);
    }

    var stream = plugins.nodemon(nodeOptions);
    stream
        .on('start', function() {
            log('Started Scripts');
            startBrowserSync(isDev, specRunner);   
        })
        .on('restart', function(info) {
            log('Restarting script because of '+ info.file + ' in ' + info.stat);
            setTimeout(function() {
                browserSync.notify('Reloading now...');
                browserSync.reload();
            }, config.browserSyncDelay);
        })
        .on('crash', function() {
            stream.emit('restart', 10);
        });
}

// Running Node inspector
function runNodeInspector(done) {
    log('Running node inspector');
    log('Browse to http://localhost:8080/debug?port=5858');
    return gulp.src([])
    .pipe(plugins.nodeInspector({
          debugPort: 5858,
          webHost: '0.0.0.0',
          webPort: 8080,
          saveLiveEdit: false,
          preload: false,
          inject: true,
          hidden: [],
          stackTraceLimit: 50,
          sslKey: '',
          sslCert: ''
        }));
}

// Log a message or series of message using Chalk Blue Color
function log(msg) {
    if(typeof(msg) === 'object') {
        for(var item in msg) {
            if(msg.hasOwnProperty(item)) {
                plugins.util.log(plugins.util.colors.blue(msg[item]));
            }
        }
    } else {
        plugins.util.log(plugins.util.colors.blue(msg));
    }
}

function startPlatoVisualizer(done) {
    log('Running Plato');
    // glob.sync returns Array of file names matching the pattern
    var files = glob.sync(config.plato.js);
    var excludeFiles = /.*\.spec\.js/;
    var plato = require('plato');
    var options = {
        title: 'Plato Inspections Report',
        exclude: excludeFiles
    };
    log('Running analysis on the following files');
    log(files);
    var outputDir = config.report + '/plato';
    if(files.length > 0) {
        plato.inspect(files, outputDir, options, platoCompleted);
    } else {
        log('No files to run analysis');
        log('Exiting Plato');
    }

    function platoCompleted(report) {
        var overview = plato.getOverviewReport(report);
        if(args.verbose) {
            log(overview.summary);
        }
        if(done) {
            done();
        }
    }

}

function getNodeOptions(isDev) {
    return {
        script: './src/server/app.js',
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: ['./src/**/*.js']

    };
}

function startBrowserSync(isDev, specRunner) {
    if(args.nosync || browserSync.active) {
        return;
    }

    log('Starting BrowserSync on port ' + port);

    if(isDev) {
        gulp.watch([config.js, config.html], ['styles'])
            .on('change', changeEvent);
    } else {
        gulp.watch([config.js, config.html], ['browserSyncReload'])
            .on('change', changeEvent);
    }

    var options = {
        proxy: 'localhost:'+port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: { // these are the defaults t,f,t,t
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadOnRestart: true,
        reloadDelay: 2000
    } ;
    if (specRunner) {
        options.startPath = config.specRunnerFile;
    }

    browserSync(options);
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + '' + event.type);
}

function errorLogger(error) {
    log('*** Start of Error ***');
    log(error);
    log('*** End of Error ***');
    this.emit('end');
}

/**
 * Inject files in ordered sequence at specified inject label
 * @param  {} src   [description]
 * @param  {[type]} label [description]
 * @param  {[type]} order [description]
 * @return {[type]}       [description]
 */
function inject(src, label, order) {
    var options = {read: false};
    if(label) {
        options.name = 'inject:'+label
    }

    return $.inject(orderSrc(src, order), options);
}


/**
 * Order a stream
 * @param  {Stream} src   The gulp src stream
 * @param  {Array} order Glob array pattern
 * @return {Stream} The ordered stream      
 */
function orderSrc(src, order) {
    // return gulp
    //         .src(src)
    //         .pipe($.if(order, $.order(src));
}