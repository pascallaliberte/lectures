import fs from 'fs-extra'
import ejs from 'ejs'
import fetch from 'node-fetch';

import moment from 'moment-timezone'

export function renderExtraPage(extras, extra, dist, views, lecturesReducer, formatReading, getAllLecturesFromAllMesses) {
  if (process.env[extra] === undefined ) { return }
  
  var date_string = process.env[extra]
  
  fetch('https://api.aelf.org/v1/messes/' + date_string + '/canada')
  .then(function(r) {
    return r.json();
  }).then (function(json) {
    
    var date = moment(date_string)
    var details = extras[extra]
    
    var lectures;
    
    if (details.messe_index !== undefined) {
      // console.log(date_string, 'https://api.aelf.org/v1/messes/' + date_string + '/canada', details.messe_index, JSON.stringify(json.messes, null, 2))
      lectures = json.messes[details.messe_index]['lectures']
    } else {
      lectures = json.messes.reduce(getAllLecturesFromAllMesses, []);
    }
    
    fs.mkdirSync(dist + details.slug + "/", { recursive: true });
    
    ejs.renderFile(views + 'extras.ejs', {
      liturgicalColor: json.informations.couleur,
      aelf_url: 'https://www.aelf.org/' + date_string + '/canada/messe',
      date: date,
      slug: details.slug,
      title: details.title,
      intro: details.intro,
      date_month_abbr: ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct', 'nov', 'déc.'][date.month()],
      annee: json.informations.annee,
      lectures: lectures.reduce(lecturesReducer, []).map(function(lecture) {
        lecture = formatReading(lecture);
        return lecture;
      })
    }, {}, function (err, str) {
      if (err) {
        console.log('error', err)
      }
      fs.writeFileSync(dist + '/' + details.slug + '/index.html', str)
    })
  });
}