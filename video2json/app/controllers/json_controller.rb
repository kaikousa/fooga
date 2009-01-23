class JsonController < ApplicationController
  require 'json'

  attr_accessor :lib

  def index
  end

  def list
    data = Media.new
    @lib = data.list
  end

end
