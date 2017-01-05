const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const compress = require('compression');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatOut = bformat({ outputMode: 'short' });
const log = bunyan.createLogger({ name: 'Gulpify - App.js', stream: formatOut });

const errorHandler = require('./utils/errorHandler.js')();
const four0four = require('./utils/404.js')();
const port = process.env.PORT || 7000;
var routes;

var environment = process.env.NODE_ENV;

log.info('About to crank up node server');
log.info('PORT=' + port);
log.info('NODE_ENV=' + environment);

app.get('/ping', function(req, res, next) {
	res.send('pong');
});

app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compress());
app.use(cors());
app.use(errorHandler.init);

switch(environment) {
	case 'build':
		log.info('** BUILD **');
		app.use(express.static('./build'));

		// Any deep link call should return index.html
		app.use('/*', express.static('./build/index.html'));
		break;
	default:
		log.info('** DEV **');
		app.use(express.static('./src/client/'));
		app.use(express.static('./'));
		app.use(express.static('./.tmp'));
		
		// Any deep link call should return index.html		
		app.use('/*', express.static('./src/client/index.html'));
		break;
}

app.listen(port, function() {
	log.info('Express server listening on port', port);
	log.info('env = ' + app.get('env') + 
		'\n __dirname = ' + __dirname + 
		'\n process.cwd = ' + process.cwd());
});

