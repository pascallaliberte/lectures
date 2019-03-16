var fs = require('fs-extra')
var rimraf = require('rimraf')
var ejs = require('ejs')
global.fetch = require('node-fetch');

var time = require('time')
var timezone = 'America/Toronto'

var dist = "dist/"
var views = "views/"

// delete the destination dir
rimraf.sync(dist)

// copy the public directories
fs.copySync('public/', dist)
fs.copySync('fonts/', dist + 'fonts/')

// build the page
function getNextSundayFrom(today) {
  d = new time.Date(today);
  d = d.setTimezone(timezone)
  var day = d.getDay(),
      diff = d.getDate() - day + 7; // next Sunday
  return new time.Date(d.setDate(diff)).setTimezone(timezone);
}

function ensureUniqueLecturesReducer(set, currentLecture) {
  if (set.findIndex(function(lecture) {
    return lecture.type === currentLecture.type
  }) !== -1) {
    return set;
  }
  
  set.push(currentLecture);
  return set;
}

var today = new time.Date()
today = today.setTimezone(timezone)

var isTodaySunday = today.getDay() === 0;
var isTodaySaturday = today.getDay() === 6;
var date = isTodaySunday? today: getNextSundayFrom(today)
var api_date = date
api_date.setHours(api_date.getHours() - api_date.getTimezoneOffset() / 60);
api_date = api_date.toJSON().substring(0, 10);

if (process.env.DATE) {
  console.log(`>> Using date ${process.env.DATE}`);
  api_date = process.env.DATE;
}

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
    annee: json.informations.annee,
    jour_liturgique_nom: json.informations.jour_liturgique_nom,
    evangile: lectures.splice(evangile_index, 1)[0],
    additionnelles: lectures.filter(function(lecture){
      return lecture.type !== "evangile" // filter out second evangile (lecture brève)
    }).reduce(ensureUniqueLecturesReducer, []),
    format_reading: function(html) {
      return html.replace(/<br\s*\/>\s*/gi, ' ').replace(/\>\s*/gi, '>').replace(/(\>)?\s?([:;?!»])/gi, '$1&nbsp;$2').replace(/(«)\s/gi, '$1&nbsp;').replace(/(\s)+/gi, ' ').replace('<p>– Acclamons la Parole de Dieu.</p>', '').replace('<p>– Parole du Seigneur.</p>', '').replace('<p>OU LECTURE BREVE</p>', '').replace(/\<\/em\>([A-Z])/gi, '</em> $1')
    }
  }, {}, function (err, str) {
    fs.writeFileSync(dist + 'index.html', str)
  })
});

var console_green = "\x1b[32m"
console.log(console_green, "Published to " + dist)