// server.js
// load the things we need
var express = require('express');
var app = express();
var path = require('path');
var compileSass = require('express-compile-sass')

app.use(compileSass({
    root: path.join(__dirname, 'dist'),
    sourceMap: true, // Includes Base64 encoded source maps in output css
    sourceComments: true, // Includes source comments in output css
    watchFiles: true, // Watches sass files and updates mtime on main files for each change
    logToConsole: false // If true, will log to console.error on errors
}));

app.use(express.static('dist'))

app.listen(8080);
console.log("Listening at http://localhost:8080")