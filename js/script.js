var weatherAppID = "395f39d422485461c237d4696317a650";

getWeatherByGeolocation();

// Get weather by geolocation, on click "btn-refresh"
function getWeatherByGeolocation() {
  clearError();
  clearInput();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showErrorOnGeo);
  } else {
    showError("Geolocation is not supported by this browser.");
  }
}

// Get position by geolocation
function showPosition(position) {
  getWeather(position.coords.latitude, position.coords.longitude, weatherAppID);
}

// show error for geolocation's call
function showErrorOnGeo(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      showError("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      showError("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      showError("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      showError("An unknown error occurred.");
      break;
  }
}

// Get weather by coordinates, on click "btn-load"
function getWeatherByLatLon(lat, lon) {
  lat = lat.replace(',', '.').trim();
  lon = lon.replace(',', '.').trim();

  var validatedCoords = validateCoords(lat, lon);
  clearError();

  if(validatedCoords === true) {
    getWeather(lat, lon, weatherAppID);
  } else {
    showError(validatedCoords);
  }
}

// Show error on page
function showError(error) {
  document.getElementsByClassName("errors")[0].innerHTML = error;
}

// Clear error field
function clearError() {
  document.getElementsByClassName("errors")[0].innerHTML = "";
}

// Make the weather request
function getWeather(lat, lon, weatherAppID) {
  var requestString = "http://api.openweathermap.org/data/2.5/weather?lat="
    + lat + "&lon=" + lon
    + "&units=metric"
    + "&APPID=" + weatherAppID;
  var request = new XMLHttpRequest();
  request.onerror = showErrorOnRequest;
  request.onload = processResults;
  request.open("GET", requestString, true);
  request.send();
}

// Show error for request
function showErrorOnRequest() {
  showError("Error: " + this.status + " " + this.statusText);
}

// Take the JSON result, process and render
function processResults() {
  if( this.status !== 200 ) {
    showError("Error: " + this.status + " " + this.statusText);
    return;
  }

  var data = prepareDataToRender( JSON.parse(this.responseText) );
  showWeather(data);
}

// Prepare JSON data for rendering; returns data's object
function prepareDataToRender(weatherItem) {
  var data = {
    city: weatherItem.name || "",
    country: weatherItem.sys.country || "somewhere on Earth",
    weather: weatherItem.weather[0].main,
    temperature: weatherItem.main.temp,
    humidity: weatherItem.main.humidity,
    pressure: weatherItem.main.pressure,
    windSpeed: weatherItem.wind.speed,
    windDegrees: weatherItem.wind.deg,
    icon: "http://openweathermap.org/img/w/"
    + weatherItem.weather[0].icon  + ".png",
    coordinates: "[" + weatherItem.coord.lat + "; " + weatherItem.coord.lon + "]",
    time: "",
    date: ""
  };

  data.time = getCurrentTime();
  data.date = getCurrentDate();

  return data;
}

// Render weather
function showWeather(data) {
  renderElement("date__time", data.time);
  renderElement("date__day-month", data.date);
  renderElement("temp__deg", data.temperature + "&degC");
  renderElement("description", data.weather);
  renderIcon(data.icon);
  renderElement("place__city", data.city + ' ' + data.country);
  renderElement("place__coords", data.coordinates);
  renderElement("details__pressure", "pressure: " + data.pressure + " hPa");
  renderElement("details__humidity", "humidity: " + data.humidity + "%");
  renderElement("details__wind", "wind: " + data.windSpeed + " m/s");
}

// Render each element of weather's data
function renderElement(itemClass, itemValue) {
  document.getElementsByClassName(itemClass)[0].innerHTML = itemValue;
}

// Render weather's icon
function renderIcon(iconSrc) {
  document.getElementsByClassName("icon")[0].src = iconSrc;
}

// Validate input data; returns true or error
function validateCoords(lat, lon) {
  if(!lat || !lon) {
    return "No data";
  }

  if(!isNumeric(lat) || !isNumeric(lon)) {
    return "Wrong type of data";
  }

  if( (lat > 90 || lat < -90) || (lon > 180 || lon < -180)) {
    return "Data is out of range";
  }

  return true;
}

// Check, is data numeric
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Get current time: hh:mm
function getCurrentTime() {
  return (new Date()).toString().split(' ').splice(4,1).join(' ').split("").splice(0, 5).join("");
}

// Get current date: Day Month #
function getCurrentDate() {
  return (new Date()).toString().split(' ').splice(0,3).join(' ');
}

// Clear inputs
function clearInput() {
  var latInput = document.getElementById("lat"),
      lonInput = document.getElementById("lon");

  latInput.value = lonInput.value = "";
}
