run lambda { |env| [200, {'Content-Type'=>'text/plain'}, StringIO.new("App Running!\n")] }
