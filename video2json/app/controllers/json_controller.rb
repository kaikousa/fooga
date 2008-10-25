class JsonController < ApplicationController

  require 'json'

  attr_accessor :results
  attr_accessor :videos

  def index
  end

  def list
    results = []
    videos = []
    files = Dir.entries(params[:path])
    for file in files
      if ! File.directory?(params[:path] + '/' + file)
        results.push(params[:path] + '/' + file)
      end
    end
    results.each do |v|
      video = File.open(v)
      videos.push(JSON::dump(video))
    end
    @results = results
    @videos = videos
  end
end
