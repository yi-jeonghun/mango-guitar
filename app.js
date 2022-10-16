const express = require('express');
const http = require('http');
const app = express();
http.createServer(app).listen(801);
// app.use(express.static(__dirname + '/'));
app.use('/', express.static(__dirname + '/'));
