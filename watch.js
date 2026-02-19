// server.js
// load the things we need
var express = require('express');
var app = express();
var path = require('path');
app.use(express.static('dist'))

app.listen(8080);
console.log("Listening at http://localhost:8080")