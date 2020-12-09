var fs = require('fs-extra')
var rimraf = require('rimraf')
var ejs = require('ejs')
global.fetch = require('node-fetch');

var moment = require('moment-timezone')
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
  d = moment(today)
  d = d.tz(timezone)
  var day = d.day(),
      diff = d.day() - day + 7; // next Sunday
  return d.day(diff).tz(timezone);
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

function getAllLecturesFromAllMesses(set, currentMesse) {
  if (!currentMesse.lectures || currentMesse.lectures.length == 0) { return set; }
  
  if (currentMesse.nom.indexOf("PASCALE") !== -1) { return set; }
  
  currentMesse.lectures.forEach(function(lecture) {
    set.push(lecture);
  });
  
  return set;
}

var today = moment()
today = today.tz(timezone)

var isTodaySunday = today.day() === 0;
var isTodaySaturday = today.day() === 6;
var date = isTodaySunday? today: getNextSundayFrom(today)
date.hours(date.hours() + date.utcOffset() / 60);
var api_date = date.format("YYYY-MM-DD")

if (process.env.DATE) {
  console.log(`>> Using date ${process.env.DATE}`);
  api_date = process.env.DATE;
}

function formatReading(lecture) {
  lecture.contenu = lecture.contenu.replace(/<br\s*\/>\s*/gi, ' ').replace(/\>\s*/gi, '>').replace(/(\>)?\s?([:;?!»])/gi, '$1&nbsp;$2').replace(/(«)\s/gi, '$1&nbsp;').replace(/(\s)+/gi, ' ').replace(' ou lecture brève','').replace('<p>– Acclamons la Parole de Dieu.</p>', '').replace('<p>– Parole du Seigneur.</p>', '').replace('<p>OU LECTURE BREVE</p>', '').replace('<p>OU BIEN</p>', '').replace(/\<\/em\>([A-Z])/gi, '</em> $1').replace('<p>OU AU CHOIX</p>', '').replace(/<p><em>Au lieu de cet Évangile.*<\/p>/, '');
  
  if (lecture.type === 'evangile' && lecture.contenu.indexOf('X = Jésus') !== -1) {
    lecture.contenu = lecture.contenu
      .replace(/(\s|>)X\s/g, '$1<span class="indicateur-interlocuteur">᛭</span>&nbsp;')
      .replace(/(\s|>)([LDFA]\.?)\s/g, '$1<span class="indicateur-interlocuteur">$2</span>&nbsp;');
  }
  
  return lecture;
}

fetch('https://api.aelf.org/v1/messes/' + api_date + '/canada')
.then(function(r) {
  return r.json();
})
.then(function(json) {
  var lectures = json.messes.reduce(getAllLecturesFromAllMesses, []);
  var evangile_index = lectures.findIndex(function(lecture) {
    return lecture.type === "evangile";
  })
  
  ejs.renderFile(views + 'index.ejs', { 
    liturgicalColor: json.informations.couleur,
    isTodaySunday: isTodaySunday,
    isTodaySaturday: isTodaySaturday,
    aelf_url: 'https://www.aelf.org/' + api_date + '/romain/messe',
    date: date,
    date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][date.month()],
    annee: json.informations.annee,
    jour_liturgique_nom: json.informations.jour_liturgique_nom,
    evangile: formatReading(lectures.splice(evangile_index, 1)[0]),
    additionnelles: lectures.filter(function(lecture){
      return lecture.type !== "evangile" // filter out second evangile (lecture brève)
    }).reduce(ensureUniqueLecturesReducer, []).map(function(lecture) {
      lecture = formatReading(lecture);
      return lecture;
    })
  }, {}, function (err, str) {
    console.log(err)
    fs.writeFileSync(dist + 'index.html', str)
  })
});

var console_green = "\x1b[32m"
console.log(console_green, "Published to " + dist)