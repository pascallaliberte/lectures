import fs from 'fs-extra'
import rimraf from 'rimraf'
import ejs from 'ejs'
import fetch from 'node-fetch';

import moment from 'moment-timezone'
var timezone = 'America/Toronto'

var dist = "dist/"
var views = "views/"

import { renderExtraPage } from './src/render_extra_pages.mjs'

// delete the destination dir
rimraf.sync(dist)

// copy the public directories
fs.copySync('public/', dist)
fs.copySync('fonts/', dist + 'fonts/')
fs.mkdirSync(dist + "quotidienne/");

var extras = {
  JEUDISAINT: {
    slug: 'jeudi-saint',
    title: "Jeudi Saint",
    intro: "Lectures de la messe du Jeudi Saint",
    messe_index: 1
  },
  VENDREDISAINT: {
    slug: 'vendredi-saint',
    title: "Vendredi Saint",
    intro: "Lectures de la messe du Vendredi Saint"
  },
  VEILLEEPASCALE: {
    slug: 'veillee-pascale',
    title: "Veillée Pascale",
    intro: "Lectures de la messe de la Veillée Pascale",
    messe_index: 0
  }
}

// build the page
function getNextSundayFrom(today) {
  var d = moment(today)
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

function collectAllLectures(lectures_to_display, currentLecture) {
  lectures_to_display.push(currentLecture)
  return lectures_to_display
}

function getAllLecturesFromAllMesses(set, currentMesse) {
  if (!currentMesse.lectures || currentMesse.lectures.length == 0) { return set; }
  
  if (currentMesse.nom.match(/pascale/i) !== null) { return set; }
  
  currentMesse.lectures.forEach(function(lecture) {
    set.push(lecture);
  });
  
  return set;
}

var today = moment()
today = today.tz(timezone)

var isTodaySunday = today.day() === 0;
var isTodaySaturday = today.day() === 6;
var sunday = isTodaySunday? today: getNextSundayFrom(today)
sunday.hours(sunday.hours() + sunday.utcOffset() / 60);
var api_date_sunday = sunday.format("YYYY-MM-DD")
var api_date_today = today.format("YYYY-MM-DD")

if (process.env.DATE) {
  console.log(`>> Using date ${process.env.DATE}`);
  api_date_sunday = process.env.DATE;
}

function formatReading(lecture) {
  if (lecture.type !== 'psaume') {
    lecture.contenu = lecture.contenu.replace(/<br\s*\/>\s*/gi, ' ')
  }
  
  lecture.contenu = lecture.contenu.replace(/\>\s*/gi, '>').replace(/(\>)?\s?([:;?!»])/gi, '$1&nbsp;$2').replace(/(«)\s/gi, '$1&nbsp;').replace(/(\s)+/gi, ' ').replace(' ou lecture brève','').replace('<p>– Acclamons la Parole de Dieu.</p>', '').replace('<p>– Parole du Seigneur.</p>', '').replace('<p>OU LECTURE BREVE</p>', '').replace('<p>OU BIEN</p>', '').replace(/\<\/em\>([A-Z])/gi, '</em> $1').replace('<p>OU AU CHOIX</p>', '').replace(/<p><em>Au lieu de cet Évangile.*<\/p>/, '');
  
  if (lecture.type === 'evangile' && lecture.contenu.indexOf('X = Jésus') !== -1) {
    lecture.contenu = lecture.contenu
      .replace(/(\s|>)X\s/g, '$1<span class="indicateur-interlocuteur">᛭</span>&nbsp;')
      .replace(/(\s|>)([LDFA]\.?)\s/g, '$1<span class="indicateur-interlocuteur">$2</span>&nbsp;');
  }
  
  return lecture;
}

fetch('https://api.aelf.org/v1/messes/' + api_date_sunday + '/canada')
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
    aelf_url: 'https://www.aelf.org/' + api_date_sunday + '/romain/messe',
    date: sunday,
    date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][sunday.month()],
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
    if (err) {
      console.log('error:', err)
    }
    fs.writeFileSync(dist + 'index.html', str)
  })
});

fetch('https://api.aelf.org/v1/messes/' + api_date_today + '/canada')
.then(function(r) {
  return r.json();
})
.then(function(json) {
  var lectures = json.messes.reduce(getAllLecturesFromAllMesses, []);
  
  var lecture = lectures[Math.floor(Math.random() * lectures.length)]; // random
  
  ejs.renderFile(views + 'quotidienne.ejs', { 
    aelf_url: 'https://www.aelf.org/' + api_date_today + '/romain/messe',
    date: today,
    date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][today.month()],
    annee: json.informations.annee,
    lecture: formatReading(lecture)
  }, {}, function (err, str) {
    console.log(err)
    fs.writeFileSync(dist + '/quotidienne/index.html', str)
  })
});

setTimeout(() => {
  renderExtraPage(extras, 'JEUDISAINT', dist, views, ensureUniqueLecturesReducer, formatReading, getAllLecturesFromAllMesses)
}, 1000)
setTimeout(() => {
  renderExtraPage(extras, 'VENDREDISAINT', dist, views, ensureUniqueLecturesReducer, formatReading, getAllLecturesFromAllMesses)
}, 2000)
setTimeout(() => {
  renderExtraPage(extras, 'VEILLEEPASCALE', dist, views, collectAllLectures, formatReading, getAllLecturesFromAllMesses)
}, 3000)

var console_green = "\x1b[32m"
console.log(console_green, "Published to " + dist)