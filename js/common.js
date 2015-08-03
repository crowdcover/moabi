requirejs.config({
  "paths": {
    "jquery": "vendor/jquery-1.11.1.min",
    "jquery-sortable": "vendor/jquery-ui-1.10.4.custom.min",
    "jquery-print": "vendor/jquery.print",
    "waypoints": "vendor/waypoints.min",
    "mapbox": "vendor/mapbox-2.1.4.min",
    "leafletImage": "vendor/leaflet-image",
    "leafletHash": "vendor/leaflet-hash",
    "leafletEasyPrint": "vendor/leaflet.easyPrint"
  },
  "shim": {
    "mapbox": { "exports": "L" },
    "leafletHash": ["mapbox"],
    "leafletEasyPrint": ["mapbox"],
    "jquery-sortable": ["jquery"],
    "jquery-print": ["jquery"],
    "waypoints": ["jquery"]
  }
});

var moabi = {};
