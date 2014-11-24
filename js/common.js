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

var moabi = {};
