$(document).ready( function(){
  //$("#afterLoad").hide();

  // Gets location from ip and uses callBack function passed into it to
  // for necessary operations on response
  function getLocation(callBack) {
      $.get("https://ipinfo.io",
              function (response) {
                callBack(response);
              },
              "jsonp");
  }

  // gets weather data using url(link) passed into it and uses callBack to do necessary
  // operations on it. isFirstCall is a boolean for whether this is the initial call
  function getWeather(callBack, link, isFirstCall) {
    $.ajax( {
      url: link,
      success: function(data) {
        callBack(data, isFirstCall)
      },
    });
  }

  // sets weather from data provided, isFirstCall boolean used to see if checkbox
  // should be checked or not
  function setWeather(data, isFirstCall) {

    var lever = false;
    var temp = kToC(data.main["temp"]);
    var wind = mpsToKph(data.wind["speed"]);
    var windDirection = windDir(data.wind["deg"]);
    var icon = "<i class=\" wi wi-owm-";
    var sunrise = data.sys["sunrise"];
    var sunset = data.sys["sunset"];
    var time = data.dt;
    var weatherID = data.weather[0]["id"];
    var windDirIcon = "<i class=\"wi wi-wind wi-from-"+windDirection.toLowerCase()+"\"></i>"

    if (isFirstCall) {
      if (data.sys["country"] === "US") {

        lever = true;
        $("#units-lever").prop("checked", true);
      }
    }

    if (lever) {
      temp = cToF(temp) + " F";
      wind = kphToMph(wind) + " mph";
    }

    else {
      temp += " C";
      wind += " kph";
    }

    icon += dayNight(sunrise, sunset, time);
    icon += "-" + weatherID + "\"></i>" ;

    $("#icon").html(icon);
    $("#temp").html(temp);
    $("#wind").html(wind +" "+ windDirection);
    $("#wind-direction-icon").html(windDirIcon);
  }

  function setPicture(response) {

    var city = response.city;
    var region = response.region;
    var latlon = response.loc.split(",");
    var photoSearchUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a1f50ffd1b73045e4b5835ddb0b687e5&tags="+city+","+region+"&tag_mode=all&safe_search=1&content_type=1&has_geo=1&lat="+latlon[0]+"&lon="+latlon[1]+"&radius=5&per_page=25&extras=url_l&format=json&nojsoncallback=1";

    $.ajax( {
      url: photoSearchUrl,
      success: function(data) {

        var photoUrl = "https://farm";
        var photoNum = Math.floor(Math.random()*25);

        photoUrl += data.photos.photo[photoNum]["farm"];
        photoUrl += ".staticflickr.com/";
        photoUrl += data.photos.photo[photoNum]["server"];
        photoUrl += "/";
        photoUrl += data.photos.photo[photoNum]["id"];
        photoUrl += "_";
        photoUrl += data.photos.photo[photoNum]["secret"];
        photoUrl += "_h.jpg";

        $("body").css("backgroundImage", "url("+ photoUrl +")");
      },
      complete: function() {
        showPage();
      }
    });
  }

  function initWeather(response) {

    $("#location").html(response.city+ ", " + response.region);

    var latlon = response.loc.split(",");
    var newUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latlon[0] + "&lon=" + latlon[1] +"&" + "APPID=31e79a30495217e5cbfe7444794d91f8";

    getWeather(setWeather, newUrl, true);
  }

  // gets weather in metric units for when lever is switched to metric
  function metricWeather(response) {

    var latlon = response.loc.split(",");
    var newUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latlon[0] + "&lon=" + latlon[1] +"&" + "APPID=31e79a30495217e5cbfe7444794d91f8";

    getWeather(setWeather, newUrl, false);
  }

  $("#units-lever").change( function() {

    if (this.checked) {
      var tempEl = document.getElementById('temp').innerHTML;
      var windEl = document.getElementById('wind').innerHTML;

      var temp = tempEl.split(" ")[0];
      var windArr = windEl.split(" ");

      temp = cToF(temp);
      var wind = kphToMph(windArr.shift());
      windArr.shift();

      $("#temp").html(temp + " F");
      $("#wind").html(wind +" mph " + windArr.join(" "));
    }

    // Get weather again in order to avoid loss of significance from many switches between metric and imperial
    else {
      getLocation(metricWeather);
    }
  });

  function windDir(deg) {
    var dirs = [];
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

    // particular operation done so direction sections fit evenly into 16 sections
    deg = (deg+11.25)% 360;

    return dirs[Math.floor(deg/22.5)];
  }

  // determines whether its day or night for icon
  function dayNight(sunrise, sunset, time) {
    if (time < sunset && time > sunrise) {
      return "day";
    }
    return "night";
  }

  // kelvin to Celsius
  function kToC(k) {
    return Math.round((k-273)*10)/10;
  }

  // Celsius to fahrenheit
  function cToF(c) {
    return Math.round((1.8*c + 32)*10)/10;
  }

  // meters per second to kph
  function mpsToKph(mps) {
    return Math.round((mps*3.6)*10)/10;
  }

  function kphToMph(kph) {
    return Math.round((kph*.62)*10)/10;
  }

  getLocation(initWeather);
  getLocation(setPicture);

  function showPage() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("afterLoad").style.opacity = 1;

    console.log(document.getElementById("afterLoad"));
  }

});
