# encoding: utf-8
require 'date'
require 'erb'

MONTH={
  "January"     => "janvier",
  "February"    => "février",
  "March"       => "mars",
  "April"       => "avril",
  "May"         => "mai",
  "June"        => "juin",
  "July"        => "juillet",
  "August"      => "août",
  "September"   => "septembre",
  "October"     => "octobre",
  "November"    => "novembre",
  "December"    => "décembre"
}

def get_next_sunday
  now = DateTime.now
  now + 7 - now.wday
end

def render_template(template, output, scope)
    tmpl = File.read(template)
    erb = ERB.new(tmpl, 0, "<>")
    File.open(output, "w") do |f|
        f.puts erb.result(scope)
    end
end

task default: %w[getrss scaffold_evangile scaffold_additionnelles]

task :getrss do

  # download the rss feed
  sh "wget -O dimanche.rss http://rss.aelf.org/a286ad4d-293b-c3e4-5187-570be155922a"

  # create rss/ directory if it doesn't exist
  sh "mkdir -p rss"

  # rename dimanche.rss to yyyy-mm-dd.rss and move to rss/ directory
  sh "mv dimanche.rss rss/" + get_next_sunday.strftime("%F") + ".rss"
end

task :scaffold_evangile do
  sunday = get_next_sunday
  render_template('templates/evangile.md.erb', "_posts/" + sunday.strftime("%F") + "-evangile.md", binding)
end

task :scaffold_additionnelles do
  sh "cp templates/additionnelles.md.erb additionnelles/" + get_next_sunday.strftime("%F") + ".md"
end
