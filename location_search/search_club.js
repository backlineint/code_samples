(function($) {

  Drupal.behaviors.search_club_nearme_behaviors = {
    attach: function (context, settings) {
      // On initial load of club finder, check to see if we can use location data to improve map.
      var toggle_state = $("input[name=toggle_state]").val();
      if ((toggle_state != 'near') && (toggle_state != 'search')) {
        checkLocation();
        $("input[name=toggle_state]").val("search");
      }
      // If we are displaying the results of a near me search, default to near me form state.
      else if (toggle_state == 'near')
      {
        // Reset form state to near me
        $('#toggle_near').addClass('active');
        $('#toggle_search').removeClass('active');
        $("#edit-location").next(".description").hide();
        $("#edit-location").hide();
        $("#location_key").show();
        // Place current location on existing map
        getLocation('place');
      }
      else {
        if(localStorage['geoLocationSet']) {
          // If the user has denied geolocation, disable near me tab.  Otherwise do nothing.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(keepMap, locationDenied);
          }
          else {
            locationDenied();
          }
        }
      }
      // If the user selects a near me location search, configure the location form accordingly.
      $('#toggle_near').click( function() {
        // Place location pin and recenter map
        getLocation('center');
      });
      // If the user selects a text based location search, configure the location form accordingly.
      $('#toggle_search').click( function() {
        // Reset form state to search
        $("#edit-location").val("");
        $("input[name=toggle_state]").val("search");
        $('#toggle_search').addClass('active');
        $('#toggle_near').removeClass('active');
        $("#location_key").hide();
        $("#edit-location").show();
        $("#edit-location").next(".description").show();
      });
    }
  };

  function checkLocation(){
    // If the user has at some point responded to our geolocation prompt, make use of that information.
    if(localStorage['geoLocationSet']) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(centerMap, locationDenied);
      }
      else {
        locationDenied();
      }
    }
  }

  function getLocation(pinType) {
    if (navigator.geolocation) {
      if (pinType == 'place') {
        navigator.geolocation.getCurrentPosition(placePosition, locationDenied);
      }
      else {
        navigator.geolocation.getCurrentPosition(centerPosition, locationDenied);
      }
    } else {
      alert(Drupal.t('Geolocation is not supported by this browser.'));
      _gaq.push(['_trackEvent', 'Geolocation', 'Request Permission', 'Not Supported']);
      locationDenied();
    }
  }

  // Place a marker and center the map at that location.
  function centerPosition(position) {
    if(!localStorage['geoLocationSet']) {
      // If this variable is set, the user has at some point responded to our geolocation prompt.
      localStorage['geoLocationSet'] = true;
      _gaq.push(['_trackEvent', 'Geolocation', 'Request Permission', 'Allow']);
    }
    $("input[name='lat']").val(position.coords.latitude);
    $("input[name='lng']").val(position.coords.longitude);
    coordValue = position.coords.latitude + "," + position.coords.longitude;
    $("#edit-location").val(coordValue);
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var m = Drupal.gmap.getMap('auto1map');
    m.map.panTo(latLng);
    m.map.setZoom(12);
    var marker = new google.maps.Marker({
      position: latLng,
      map: m.map,
      icon: '/sites/all/modules/contrib/gmap/markers/yellow.png',
      title: Drupal.t('Your location')
    });
    // Reset form state to near me.
    // Doing this within the success callback improves usability in cases where the geolocaiton prompt is defered or denied.
    $("input[name=toggle_state]").val("near");
    $('#toggle_near').addClass('active');
    $('#toggle_search').removeClass('active');
    $("#edit-location").next(".description").hide();
    $("#edit-location").hide();
    $("#location_key").show();
  }

  // Center the map at at location without placing a pin.
  function centerMap(position) {
    if(!localStorage['geoLocationSet']) {
      localStorage['geoLocationSet'] = true;
      _gaq.push(['_trackEvent', 'Geolocation', 'Request Permission', 'Allow']);
    }
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var m = Drupal.gmap.getMap('auto1map');
    m.map.panTo(latLng);
    m.map.setZoom(12);
  }

  // Place a pin at a location, but don't recenter or zoom map.
  function placePosition(position) {
    if(!localStorage['geoLocationSet']) {
      localStorage['geoLocationSet'] = true;
      _gaq.push(['_trackEvent', 'Geolocation', 'Request Permission', 'Allow']);
    }
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var m = Drupal.gmap.getMap('auto1map');
    var marker = new google.maps.Marker({
      position: latLng,
      map: m.map,
      icon: '/sites/all/modules/contrib/gmap/markers/yellow.png',
      title: Drupal.t('Your location')
    });
  }

  function keepMap() {
    // Keep the map as is - navigator.geolocation.getCurrentPosition seems to require some success callback function if we are going to use a failure callback.
  }

  function locationDenied() {
    if(!localStorage['geoLocationSet']) {
      localStorage['geoLocationSet'] = true;
      _gaq.push(['_trackEvent', 'Geolocation', 'Request Permission', 'Deny']);
    }
    // Disable Near Me links
    $('#toggle_links').replaceWith('<p id = "toggle_links"><span id = "toggle_search" class = "active">' + Drupal.t('Search') + '</span><span class = "toggle_divider disabled">|</span><span id="toggle_near_disabled" class = "disabled">' + Drupal.t('Use Current Location') + '</span></p>');
    // Reset form to location search
    $("#edit-location").val("");
    $("input[name=toggle_state]").val("search");
    $('#toggle_search').addClass('active');
    $('#toggle_near').removeClass('active');
    $("#location_key").hide();
    $("#edit-location").show();
    $("#edit-location").next(".description").show();
  }

})(jQuery);
