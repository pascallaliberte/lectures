require 'date'

task default: %w[getrss]

task :getrss do

  # download the rss feed
  sh "wget -O dimanche.rss http://rss.aelf.org/a286ad4d-293b-c3e4-5187-570be155922a"

  # rename dimanche.rss to yyyy-mm-dd.rss
  now = DateTime.now
  dimanche = now + 7 - now.wday
  dimanche_yyyy_mm_dd = dimanche.strftime("%F")

  # create rss/ directory if it doesn't exist
  sh "mkdir -p rss"

  # move .rss to rss/ directory
  sh "mv dimanche.rss rss/#{dimanche_yyyy_mm_dd}.rss"
end
