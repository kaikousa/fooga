class JsonController < ApplicationController
  require 'json'
  require 'ftools'
  require "model/audio"
  
  attr_accessor :lib

  def index
    if ! File.exist?("#{RAILS_ROOT}/videos")
                    File.makedirs("#{RAILS_ROOT}/videos")
    end
    if ! File.exist?("#{RAILS_ROOT}/audio")
                    File.makedirs("#{RAILS_ROOT}/audio")
    end
    
    list
  end

  def list
    data = Media.new
    @lib = data.list
  end
  
  def render_movie
    movie_data = params[:post]["movie"]
    task = Task.new
    task.name = "Created in Rails"
    task.data = movie_data
    task.status = true
    task.save
  end
  
  def test_vee
    @audio = Audio.new("ghosts.mp3", "", "", "", [])
  end

end
