require 'sinatra'
require 'json'
require 'pry'

get '/' do
  File.read('views/index.html')
end

get '/favorites' do
  response.header['Content-Type'] = 'application/json'
  data = File.read('data.json')
end

post '/favorites' do
  file = File.read('data.json')
  # Check to see if there's anything in the file (otherwise we can't parse it)
  favorite_movies = file.empty? ? [] : JSON.parse(file)
  # Check to see if there's already a movie with the current name in the list
  if favorite_movies.map { |movie| movie['oid'] }.include?(params[:oid])
    return { error: :duplicate }.to_json
  end
  # Append the newly favorited movie to the list of favorite movies
  new_movie = { name: params[:name], oid: params[:oid] }
  favorite_movies << new_movie
  # Overwrite what's currently sitting in the data.json file
  File.write('data.json', JSON.pretty_generate(favorite_movies))
  new_movie.to_json
end
