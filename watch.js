// server.js
// load the things we need
import express from 'express';
var app = express();
import path from 'path';
import sassMiddleware from 'node-sass-middleware'

app.use(sassMiddleware({
    src: path.join(__dirname, '_sass'),
    dest: path.join(__dirname, 'dist/css'),
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

app.use(express.static('dist'))

app.listen(8080);
console.log("Listening at http://localhost:8080")