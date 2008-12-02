class JsonController < ApplicationController
  require 'json'

  attr_accessor :videos


  def index
  end

  def list
    settings = YAML::load( File.open( "#{RAILS_ROOT}/config/settings.yml" ) )
    videos = Array.new
    video = Hash.new
    audio = false
    dur_h = 0
    dur_m = 0
    dur_s = 0
    dur_ms = 0

    files = Dir.entries(settings["path"])
    for file in files
      if ! File.directory?(settings["path"] + file) 
        video = {}
        playable_filename = settings["path"] + file
        filename = settings["path"] + file
        name = File.basename(settings["path"] + file , File.extname(settings["path"] + file))
        type = "video"

        cmdi = settings["ffmpeg_info"]
        cmdi = cmdi.sub( "<filename_withext>", settings["path"] + file )
        IO.popen(cmdi) do |pipe|
          pipe.each("\n") do |line|
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
          video["dur_h"] = dur_h
          video["dur_m"] = dur_m
          video["dur_s"] = dur_s
          video["dur_ms"] = dur_ms
          video["type"] = type
          video["name"] = name
          video["filename"] = filename
          video["playable_filename"] = playable_filename
          videos << video
        end
      end
    end
    @videos = videos
  end
end

