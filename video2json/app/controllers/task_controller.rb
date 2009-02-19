class TaskController < ApplicationController
  
  def index
    task = Task.new
    task.name = "Created from Rails"
    task.data = nil
    task.status = true;
    task.save
  end
  
end
