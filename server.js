// server.js
// load the things we need
var express = require('express');
var app = express();
var path = require('path');
var sassMiddleware = require('node-sass-middleware')

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// compress all responses
// app.use(compression())

app.use(sassMiddleware({
    src: path.join(__dirname, '_sass'),
    dest: path.join(__dirname, 'css'),
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
    res.render('index');
});

app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
app.use('/bower_components', express.static('bower_components'))

app.listen(8080);