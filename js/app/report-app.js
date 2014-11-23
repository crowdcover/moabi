// report module
define(['app/map-app', 'waypoints'], function (moabi, waypoints) {
  $.extend(moabi, {
    initReport: function() {
      moabi.initMap();
      $('.report-panel section').waypoint(this.reportScroll, {
        context: '.report-panel',
        offset: '80%'
      });
      $('.navigate').on('click', 'a', this.navigate);
    },

    reportScroll: function(dir) {
      if(dir === 'down'){
          var $this = $(this);
          $this.prev().removeClass('active');
          $this.addClass('active');
      }else{
          var $this = $(this).prev();
          $this.next().removeClass('active');
          $this.addClass('active');
      }
      var nav = $this.data('nav'),
          newLayers = $this.data('id'),
          newLayer;

      if(nav){
          moabi.map.setView([nav[0], nav[1]], nav[2]);
      }
      // change Layers
      moabi.removeAllExcept(newLayers);
      if(newLayers){
        // perform a quick lookup to test if newLayers is already displayed
        var displayedLayersIds = moabi.getLayers();

        for(i=0; i<newLayers.length; i++){
          newLayer = newLayers[i];
          if(displayedLayersIds.indexOf(newLayer) === -1){
            moabi.changeLayer(newLayers[i]);
          }
        }
      }
    },

    navigate: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var $this = $(this),
          lat = $this.data("nav")[0],
          lon = $this.data("nav")[1],
          zoom = $this.data("nav")[2];

      moabi.map.setView([lat, lon], zoom);

      $this.parent('li').siblings('li').children('a.active').removeClass('active');
      $this.addClass('active');
    },

  });
  return moabi;
});
