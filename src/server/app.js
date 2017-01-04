const http = require('http');
const express = require('express');
const app = express();

app.get('/', function(request, response, next) {
	// response.sendFile(__dirname+'/public/index.html');
	// response.send('Looks Cool ++');
});

http.createServer(app).listen(process.env.port || 7000);