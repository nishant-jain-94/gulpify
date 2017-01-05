module.exports = function() {
	var service = {
		init: init,
		logerrs: logerrs
	};

	return service;

	function init(err, req, res, next) {
		var status = err.statusCode || 500;
		if(err.message) {
			res.send(status, err.message);
		} else {
			res.send(status, err);
		}
	}

	function logerrs(err, req, res, next) {
		var status = err.statusCode || 500;
		console.err(status + '' + (err.message ? err.message : err));
		if(err.stack) {
			console.err(err.stack);
		}
		next(err);
	}

};