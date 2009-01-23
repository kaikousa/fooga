class Media

  def initialize
  end

  def list
    settings = YAML::load( File.open( "#{RAILS_ROOT}/config/settings.yml" ) )
    media = Array.new
    video = Hash.new
    audio = Hash.new

    files = Dir.entries(RAILS_ROOT + settings["video_path"])
    for file in files
      puts "\n\n________________________________________"
      puts file
      puts "________________________________________\n\n"
      if ! File.directory?(RAILS_ROOT + settings["video_path"] + file) 
      puts "\n\n________________________________________"
      puts file
      puts RAILS_ROOT + settings["video_path"]
      puts "\n\n________________________________________"
        video = {}
        playable_filename = RAILS_ROOT + settings["video_path"] + file
        filename = RAILS_ROOT + settings["video_path"] + file
        name = File.basename(RAILS_ROOT + settings["video_path"] + file , File.extname(RAILS_ROOT+ settings["video_path"] + file))
        type = "video"
        dur_h = 0
        dur_m = 0
        dur_s = 0
        dur_ms = 0
        audio = false

        cmdi = settings["ffmpeg_info"]
        cmdi = cmdi.sub( "<filename_withext>", RAILS_ROOT + settings["video_path"] + file )
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
        end
        media << video
      end
    end
    dur_h = 0
    dur_m = 0
    dur_s = 0
    dur_ms = 0
    files = Dir.entries(RAILS_ROOT + settings["audio_path"])
    for file in files
      if ! File.directory?(RAILS_ROOT + settings["audio_path"] + file) 
        audio = {}
        playable_filename = RAILS_ROOT + settings["audio_path"] + file
        filename = RAILS_ROOT + settings["audio_path"] + file
        name = File.basename(RAILS_ROOT + settings["audio_path"] + file , File.extname(RAILS_ROOT + settings["audio_path"] + file))
        type = "audio"

        cmdi = settings["ffmpeg_info"]
        cmdi = cmdi.sub( "<filename_withext>", RAILS_ROOT + settings["audio_path"] + file )
        IO.popen(cmdi) do |pipe|
          pipe.each("\n") do |line|
            puts line
            if line =~ /Duration: (\d+):(\d+):(\d+).(\d+)/
              dur_h = $1.to_i
              dur_m = $2.to_i
              dur_s = $3.to_i
              dur_ms = $4.to_i
            end
          end
          audio["dur_h"] = dur_h
          audio["dur_m"] = dur_m
          audio["dur_s"] = dur_s
          audio["dur_ms"] = dur_ms
          audio["type"] = type
          audio["name"] = name
          audio["filename"] = filename
          audio["playable_filename"] = playable_filename
        end
        media << audio
      end
      puts media
    end
    return media
  end
end
