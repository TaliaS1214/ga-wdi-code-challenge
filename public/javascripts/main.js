// This file contains all logic related to searching for and favoriting movies.
(function(){
  // Initializing variables we'll need for the various inputs and request
  // objects and parameters.
  var xhr, searchTerm, requestUrl;

  // Left Column DOM elements
  var searchField = document.getElementById('search-field'),
      searchButton = document.getElementById('search-button'),
      movieList = document.getElementById('movie-list'),
      favoriteHeader = document.getElementById('favorite-header'),
      mainHeader = document.getElementById('main-header'),

  // Right Column DOM elements
      currentTitle = document.getElementById('current-title'),
      currentPoster = document.getElementById('current-poster'),
      currentMovie = document.getElementById('current-movie'),
      favoriteButton = document.getElementById('favorite-button'),

  // Favorite Items
      viewFavoritesButton = document.getElementById('favorites');

  // Set up various event listeners
  searchButton.addEventListener('click', searchMovies);
  favoriteButton.addEventListener('click', addToFavorites);
  viewFavoritesButton.addEventListener('click', viewFavorites);

  // Create HTTP Request object for making API requests
  xhr = new XMLHttpRequest();

  // Contains logic for sending request to OMDB API
  function searchMovies(event) {
    // Prevent form from submitting post request
    event.preventDefault();
    // Accessing text written to the search bar / input
    searchTerm = searchField.value;
    if (searchTerm != "") {
      // Clear whatever might currently be sitting in the results section
      clearResults();
      if (mainHeader.style.display == "none") {
        toggleHeaders();
      }
      requestUrl = "https://www.omdbapi.com/?s=" + searchTerm;
      // Function to execute after the AJAX request to the OMDB API is complete.
      xhr.onreadystatechange = function() {
        // Manipulating the response from the OMDB API
        // readyState = 4 means the request is complete
        // status = 200 means the request was successful
        if (xhr.readyState == 4 && xhr.status == 200) {
          searchResults = JSON.parse(xhr.response)['Search'];
          displayMovies(searchResults);
        }
      }

      // Send the AJAX request to the specific URL and specify that the request
      // is asynchronous.
      xhr.open("GET", requestUrl, true);
      xhr.send();

      function displayMovies(movies) {
        var newDiv;
        if (movies) {
          movies.forEach(function (movie) {
            // Create the <div> element inside which the individual movie result
            // will sit.
            newDiv = document.createElement('li');

            // Set the innerHTML of the div to just be the movie title.
            newDiv.innerHTML = movie['Title'];
            newDiv.setAttribute('class', 'search-result');

            // Append the <div> to the results section of the page
            movieList.appendChild(newDiv);

            // Add a click event handler that display the movie details when the movie
            // title is click on.
            addClickHandler(newDiv, movie);
          });
        } else {
          newDiv = document.createElement('li');
          newDiv.innerHTML = "No search results found.";
          movieList.appendChild(newDiv);
        }
      }

      function addClickHandler(el, movieData) {
        el.addEventListener('click', function(event) {
          // Display the movie title / year
          currentTitle.innerHTML = movieData['Title'] + ' (' + movieData['Year'] + ')';

          // Display the movie poster if it's available via the API
          if (movieData['Poster'] != 'N/A') {
            currentPoster.src = movieData['Poster'];
          } else {
            currentPoster.src = "";
          }

          // Set data on the current movie div
          currentMovie.setAttribute('data-title', movieData['Title']);
          currentMovie.setAttribute('data-id', movieData['imdbID']);

          // If the favorite button is hidden, display it.
          if (favoriteButton.style.visibility = "hidden") {
            favoriteButton.style.visibility = "visible";
          }
        });
      }
    }
  }

  function addToFavorites(event) {
    // Get data to send to server
    var title = currentMovie.getAttribute('data-title');
    var id = currentMovie.getAttribute('data-id');

    // Construct parameter string
    var params = 'name=' + title + '&oid=' + id;

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var response = JSON.parse(xhr.responseText);
        if (response.error == "duplicate") {
          alert(title + " has already been added to your list of favorites!");
        } else {
          alert(title + " has been saved to your list of favorites!");
        }
      }
    }
    // Send the AJAX request to the specific URL and specify that the request
    // is asynchronous.
    xhr.open("POST", '/favorites', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
  }

  // Function for viewing the favorite movies that have been persisted to the
  // data.json file.
  function viewFavorites(event) {
    // Clear values
    clearResults();
    searchField.value = '';
    toggleHeaders();

    // Function to execute after the AJAX request to the OMDB API is complete.
    xhr.onreadystatechange = function() {
      // Manipulating the response from the OMDB API
      // readyState = 4 means the request is complete
      // status = 200 means the request was successful
      if (xhr.readyState == 4 && xhr.status == 200) {
        favoriteItems = xhr.response == "" ? null : JSON.parse(xhr.response);
        displayFavoriteItems(favoriteItems);
      }
    }

    // Send the AJAX request to the specific URL and specify that the request
    // is asynchronous.
    xhr.open("GET", "/favorites", true);
    xhr.send();

    // Function for rendering the favorite movies to the page
    function displayFavoriteItems(items) {
      if (items) {
        items.forEach(function(item) {
          var newDiv = document.createElement('li');
          newDiv.innerHTML = item.name + ' (imdb ID: ' + item.oid + ')';
          movieList.appendChild(newDiv);
        });
      } else {
        newDiv = document.createElement('li');
        newDiv.innerHTML = "You haven't favorited any movies yet!";
        movieList.appendChild(newDiv);
      }
    }
  }

  // Function for toggling between the "Favorite Movies" header and the "Search Results" header.
  function toggleHeaders() {
    if (favoriteHeader.style.display == "none") {
      favoriteHeader.style.display = "inline-block";
      mainHeader.style.display = "none";
    } else {
      favoriteHeader.style.display = "none";
      mainHeader.style.display = "inline-block";
    }
  }

  // Clear search results and current movie data
  function clearResults() {
    // Clear the list of search results
    movieList.innerHTML = " ";

    // Clear the current movie data
    currentTitle.innerHTML = "";
    currentPoster.src = "";
    currentMovie.setAttribute('data-title', '');
    currentMovie.setAttribute('data-id', '');

    // Hide the favorite button
    favoriteButton.style.visibility = "hidden";
  }

}());
