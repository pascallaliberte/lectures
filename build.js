var fs = require('fs-extra')
var rimraf = require('rimraf')
var ejs = require('ejs')
var time = require('time')
global.fetch = require('node-fetch');

var dist = "dist/"
var views = "views/"

// delete the destination dir
rimraf.sync(dist)

// copy the public directories
fs.copySync('public/', dist)
fs.copySync('fonts/', dist + 'fonts/')

// build the page
function getNextSundayFrom(today) {
  d = new Date(today);
  var day = d.getDay(),
      diff = d.getDate() - day + 7; // next Sunday
  return new Date(d.setDate(diff));
}

var today = new time.Date()
today = today.setTimezone('America/Toronto')

var isTodaySunday = today.getDay() === 0;
var isTodaySaturday = today.getDay() === 6;
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
  
  ejs.renderFile(views + 'index.ejs', { 
    liturgicalColor: json.informations.couleur,
    isTodaySunday: isTodaySunday,
    isTodaySaturday: isTodaySaturday,
    date: date,
    date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][date.getMonth()],
    evangile: lectures.splice(evangile_index, 1)[0],
    additionnelles: lectures.filter(function(lecture){
      return lecture.type !== "evangile" // filter out second evangile (lecture brève)
    }),
    format_reading: function(html) {
      return html.replace(/<br\s*\/>\s*/gi, ' ').replace(/\>\s*/gi, '>').replace(/\s([:;?!»])/gi, '&nbsp;$1').replace(/(«)\s/gi, '$1&nbsp;').replace(/(\s)+/gi, ' ').replace('<p>– Acclamons la Parole de Dieu.</p>', '').replace('<p>– Parole du Seigneur.</p>', '').replace('<p>OU LECTURE BREVE</p>', '')
    }
  }, {}, function (err, str) {
    fs.writeFileSync(dist + 'index.html', str)
  })
});

var console_green = "\x1b[32m"
console.log(console_green, "Published to " + dist)