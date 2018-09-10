// server.js
// load the things we need
var express = require('express');
var app = express();
var path = require('path');
var sassMiddleware = require('node-sass-middleware')
global.fetch = require('node-fetch');

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
    function getNextSundayFrom(today) {
      d = new Date(today);
      var day = d.getDay(),
          diff = d.getDate() - day + 7; // next Sunday
      return new Date(d.setDate(diff));
    }
    
    var today = new Date()
    var isTodaySunday = today.getDay() === 0;
    var date = isTodaySunday? today: getNextSundayFrom(today)
    var api_date = date.toJSON().substring(0, 10);
  
    fetch('https://api.aelf.org/v1/messes/' + api_date + '/canada')
    .then(function(r) {
      return r.json();
    })
    .then(function(json) {
      var lectures = json.messes[0].lectures;
      var evangile_index = lectures.findIndex(function(lecture) {
        return lecture.type === "evangile";
      })
      
      res.render('index', { 
        isTodaySunday: isTodaySunday,
        date: date,
        date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][date.getMonth()],
        evangile: lectures.splice(evangile_index, 1)[0],
        additionnelles: lectures,
        format_reading: function(html) {
          return html.replace(/<br\s*\/>\s*/gi, ' ').replace(/\>\s*/gi, '>').replace(/\s([:;?!»])/gi, '&nbsp;$1').replace(/(«)\s/gi, '$1&nbsp;').replace(/(\s)+/gi, ' ').replace('<p>– Acclamons la Parole de Dieu.</p>', '').replace('<p>– Parole du Seigneur.</p>', '')
        }
      })
    });
});

app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
app.use('/bower_components', express.static('bower_components'))
app.use(express.static('public'))

app.listen(8080);