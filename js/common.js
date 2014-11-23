requirejs.config({
  "paths": {
    "jquery": "vendor/jquery-1.11.1.min",
    "jquery-sortable": "vendor/jquery-ui-1.10.4.custom.min",
    "waypoints": "vendor/waypoints.min",
    "mapbox": "vendor/mapbox-2.1.4.min",
    "leafletImage": "vendor/leaflet-image",
    "leafletHash": "vendor/leaflet-hash"
  },
  "shim": {
    "mapbox": { "exports": "L" },
    "leafletHash": ["mapbox"]
  }
});

require(["jquery"], function(){
  var headerDropdown = function(e){
    e.preventDefault();
    e.stopPropagation();
    $(this).parent('.dropdown').toggleClass('open');
  };

  var printPage = function(e){
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };
  $('header .dropdown').on('click', 'a.dropdown-button', headerDropdown);
  $('a.print-page').on('click', printPage);
});
