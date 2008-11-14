class JsonController < ApplicationController
  require 'json'

  attr_accessor :video
  attr_accessor :videos


  def index
  end

  def list
    settings = YAML::load( File.open( "#{RAILS_ROOT}/config/settings.yml" ) )
    videos = Array.new
    video = Hash.new

    files = Dir.entries(settings["path"])
    for file in files
      if ! File.directory?(settings["path"] + file) 
        fps = 0.0
        res_w = 0
        res_h = 0
        audio = false
        dur_h = 0
        dur_m = 0
        dur_s = 0
        dur_ms = 0

        cmdi = settings["ffmpeg_info"]
        cmdi = cmdi.sub( "<filename_withext>", settings["path"] + file )
        IO.popen(cmdi) do |pipe|
          pipe.each("\n") do |line|
            # Get the framerate from the text output
            if line =~ /(\d+).(\d+) fps/
              fps = ($1 + "." + $2).to_f if fps == 0.0
            end
            # Get the resolution from the text output
            if line =~ /(\d+)x(\d+) (\[)/
              res_w = $1.to_i
              res_h = $2.to_i
            end
            # Check, if the videofile has an audio stream
            if line =~ /Audio: /
              audio = true
            end
            #Check the duration of the video file
            if line =~ /Duration: (\d+):(\d+):(\d+).(\d+)/
              dur_h = $1.to_i
              dur_m = $2.to_i
              dur_s = $3.to_i
              dur_ms = $4.to_i
            end
          end
          puts "------------ New file--------------------------------"
          puts "Local variables:"
          puts res_w
          puts res_h
          puts dur_h
          puts dur_m
          puts dur_s
          puts dur_ms
          puts "------------------------------------------------------"
          puts "Video hash:"
          video["res_w"] = res_w
          video["res_h"] = res_h
          video["dur_h"] = dur_h
          video["dur_m"] = dur_m
          video["dur_s"] = dur_s
          video["dur_ms"] = dur_ms
          puts video["res_w"] 
          puts video["res_h"] 
          puts video["dur_h"] 
          puts video["dur_m"] 
          puts video["dur_s"] 
          puts video["dur_ms"]
          videos << video
          puts "------------------------------------------------------"
          puts "Videos array:"
          puts videos
        end
      end
    end
    @videos = videos
    @video = videos.to_json
  end
end

