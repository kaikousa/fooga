class JsonController < ApplicationController
  require 'json'

  attr_accessor :lib

  def index
    if ! File.exist?("#{RAILS_ROOT}/videos")
                    File.makedirs ("#{RAILS_ROOT}/videos")
    end
    if ! File.exist?("#{RAILS_ROOT}/audio")
                    File.makedirs ("#{RAILS_ROOT}/audio")
    end
  end

  def list
    data = Media.new
    @lib = data.list
  end

end
