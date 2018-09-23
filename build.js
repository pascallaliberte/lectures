var fs = require('fs-extra')
var rimraf = require('rimraf')
var ejs = require('ejs')
global.fetch = require('node-fetch');

var dist = "dist/"
var views = "views/"

// delete the destination dir
rimraf.sync(dist)

// copy the public directories
fs.copySync('public/', dist)
fs.copySync('js/', dist + 'js/')
fs.copySync('bower_components/', dist + 'bower_components/')

// build the css


// build the page
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
  
  ejs.renderFile(views + 'index.ejs', { 
    liturgicalColor: json.informations.couleur,
    isTodaySunday: isTodaySunday,
    date: date,
    date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][date.getMonth()],
    evangile: lectures.splice(evangile_index, 1)[0],
    additionnelles: lectures,
    format_reading: function(html) {
      return html.replace(/<br\s*\/>\s*/gi, ' ').replace(/\>\s*/gi, '>').replace(/\s([:;?!»])/gi, '&nbsp;$1').replace(/(«)\s/gi, '$1&nbsp;').replace(/(\s)+/gi, ' ').replace('<p>– Acclamons la Parole de Dieu.</p>', '').replace('<p>– Parole du Seigneur.</p>', '')
    }
  }, {}, function (err, str) {
    fs.writeFileSync(dist + 'index.html', str)
  })
});