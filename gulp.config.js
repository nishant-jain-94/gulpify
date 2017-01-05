module.exports = function() {
    var server = './src/server';
    var client = './src/client';
    var clientApp = client + '/app/';
    var report = './report';
    var nodeModules = 'node_modules';
    var temp = './.tmp';

    var config = {
        alljs: [
            './src/**/*.js',
            './*.js'
        ],
        build: './build',
        temp: temp,
        js: client + '**/*.js',
        html: client + '**/*.html',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        plato: {
            js: ['./src/**/*.js']
        },
        report: report,
        browserReloadDelay: 5000,
        source: 'src/',
        nodeServer: './src/server/app.js',
        defaultPort: '7000',
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },
        bower: {
            // json: require('./bower.json'),
            // directory: './bower_components/'

        },

    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory
        }

        return options;
    };

    return config;
};