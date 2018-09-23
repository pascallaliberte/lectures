var fs = require('fs-extra')
var rimraf = require('rimraf')
var ejs = require('ejs')

var dist = "dist/"
var views = "views/"

// delete the destination dir
rimraf.sync(dist)

// copy the public directories
fs.copySync('public/', dist)
fs.copySync('js/', dist + 'js/')
fs.copySync('bower_components/', dist + 'bower_components/')

// build the pages
// ejs.renderFile(views + 'index.ejs', )