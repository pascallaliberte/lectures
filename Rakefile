require 'date'

def get_next_sunday
  now = DateTime.now
  now + 7 - now.wday
end

task default: %w[getrss scaffold]

task :getrss do

  # download the rss feed
  sh "wget -O dimanche.rss http://rss.aelf.org/a286ad4d-293b-c3e4-5187-570be155922a"

  # create rss/ directory if it doesn't exist
  sh "mkdir -p rss"

  # rename dimanche.rss to yyyy-mm-dd.rss and move to rss/ directory
  sh "mv dimanche.rss rss/" + get_next_sunday.strftime("%F") + ".rss"
end

task :scaffold do
  sh "cp templates/dimanche.md.erb _posts/" + get_next_sunday.strftime("%F") + "-dimanche.md"
  sh "cp templates/additionnelles.md.erb additionnelles/" + get_next_sunday.strftime("%F") + ".md"
end
