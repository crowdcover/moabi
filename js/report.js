//Load common code for require config, then load the app logic for this page.
require(['./common'], function (moabi) {
  require(['app/report-app'], function(app){

    app.initReport();

  });
});
