//Load common code for require config, then load the app logic for this page.
require(['./common'], function (moabi) {
  require(['app/map-app'], function(app){

    app.initMap();
    // COMMENT THIS OUT: USE FOR TESTING PURPOSES
    window.moabi = require('app/map-app');
  });
});
