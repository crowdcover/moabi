---
---
{% include js/jquery-1.11.1.min.js %}
{% include js/jquery-ui-1.10.4.custom.min.js %}
{% include js/waypoints.min.js %}
{% include js/leaflet-image.js %}
{% include js/leaflet-hash.js %}

;(function(context) {
var moabi = {
    global: function() {
        $('header .dropdown').on('click', 'a.dropdown-button', this.headerDropdown);
        $('a.print-page').on('click', this.printPage);
        // modularize and load only on map pages
        this.initMap();
        $('#map').on('changeLayer', this.changeLayer);
        $('.layer-ui li.layer-toggle').on('click', 'a', this.layerButtonClick);
        $('.sortable').sortable({
          placeholder: "ui-state-highlight",
          update: moabi.reorderLayers
        });
        $('.slider').on('click', 'a', this.slidePanel);
        $('#snap').on('click', this.mapCapture);
        $('.page-fade-link').on('click', this.fade2Page);
        // modularize and load only on report pages
        $('.report-panel section').waypoint(this.reportScroll, {
            context: '.report-panel',
            offset: '80%'
        });
        $('.navigate').on('click', 'a', this.navigate);
        // modularize and load only on documentation pages
        $('.show-opt-row').on('click', this.showRow);
        $('a[href^="#"]').on('click', this.textScroll);
    },

    headerDropdown: function(e){
      e.preventDefault();
      e.stopPropagation();
      $(this).parent('.dropdown').toggleClass('open');
    },

    printPage: function(e){
      e.preventDefault();
      e.stopPropagation();
      window.print();
    },

    initMap: function(){
      // temp check: if loaded on a page w/ no map, don't run initMap
      if(! $('#map').length ) return
      L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXMtbGFuZS1jb25rbGluZyIsImEiOiJ3RHBOc1BZIn0.edCFqVis7qgHPRgdq0WYsA';
      this.map = L.mapbox.map('map', undefined, {
        layers: [mapLayers.baseLayer.id],
        center: mapLayers.baseLayer.latlon,
        zoom: mapLayers.baseLayer.zoom,
        scrollWheelZoom: false,
        minZoom: 4,
        maxZoom: 18
      });

      this.map.zoomControl.setPosition('topleft');
      this.leaflet_hash = L.hash(this.map);

      this.map.legendControl.addLegend("<h3 class='center keyline-bottom'>Legend</h3>");

      moabi.leaflet_hash.on('update', moabi.getLayerHash);
      moabi.leaflet_hash.on('change', moabi.setLayerHash);
      moabi.leaflet_hash.on('hash', moabi.updateExportLink);
      moabi.updateExportLink(location.hash);
    },

    // changeLayer() and subsidiary functions, triggered on changeLayer Event //
    changeLayer: function(e, mapId){
      // initiate everything that should happen when a map layer is added/removed
      // triggered by custom event 'changeLayer'
      // console.log('chageLayer fired.  mapId: ', mapId, 'event: ', e);

      // alias tileLayer in mapLayers, if not already
      var alreadyAliased = true
      if(! mapLayers.dataLayers[mapId]){
        mapLayers.dataLayers[mapId] = L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png');
        alreadyAliased = false;
      }
      var tileLayer = mapLayers.dataLayers[mapId];

      // check if layer is already present
      if(moabi.map.hasLayer(tileLayer)){
        // run all remove layer actions
        moabi.map.removeLayer(tileLayer);
        moabi.removeLegend(mapId);
        moabi.removeSummary(mapId);
        moabi.clearGrids();

        // if the removed layer was top layer, add grid of new top layer
        var displayedLayers = moabi.getDisplayedLayers(),
            nextLayer;
        moabi.removeLayerButton(mapId);

        if(mapId === displayedLayers.eq(0).data('id')){
          var nextLayerId = displayedLayers.eq(1).data('id');
          if(nextLayerId){
            moabi.addGrid(nextLayerId, moabi.getLayerJSON(nextLayerId).template);
          }
        }
      }else{
        // run all add layer actions:
          // add layer to map; add legend; move layer-ui button
          // show description summary; add grid; update hash
        var layerJSON = moabi.getLayerJSON(mapId);
        moabi.map.addLayer(tileLayer);
        moabi.showLayerButton(mapId)
        moabi.showLegend(mapId, layerJSON.legend);
        moabi.showSummary(mapId, layerJSON.description);
        // not very smart: simply remove all grids and add for the new layer
        moabi.clearGrids()
        moabi.addGrid(mapId, layerJSON.template);
      }
      moabi.leaflet_hash.trigger('move');
    },

    getLayerJSON: function(mapId){
      var layerJSON;
      $.ajax('/map_layers.json', {
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function(returnedJSON){
          layerJSON = returnedJSON;
        },
        async: false
      });

      return layerJSON[mapId];
    },

    showLegend: function(mapId, legendContent){
      $('.map-legend').append(
        $('<div></div>').addClass('moabi-legend')
                        .attr('data-id', mapId)
                        .append(legendContent)
      );
    },

    removeLegend: function(mapId){
      $('.map-legend .moabi-legend[data-id="' + mapId + '"]').remove();
    },

    showLayerButton: function(mapId){
      // move layerButton from .not-displayed to .displayed
      var layerButton = $('.layer-ui ul.not-displayed li.layer-toggle[data-id="' + mapId + '"]'),
          displayed = $('.layer-ui .displayed');

      layerButton.addClass('active').prependTo(displayed);
    },

    removeLayerButton: function(mapId){
      // move layerButton from .displayed to where it was originally located in .not-displayed
      var layerButton = $('.layer-ui ul.displayed li.layer-toggle[data-id="' + mapId + '"]').removeClass('active'),
          layerButtonIndex = layerButton.data('index'),
          notDisplayedButtons = $('.layer-ui .not-displayed li'),
          notDisplayedButtonsCount = notDisplayedButtons.length;

      moabi.notDisplayedButtons = notDisplayedButtons;

      for(i=0; i<notDisplayedButtonsCount; i++){
        // if button index is less than the smallest, insert at beginning
        var notDisplayedButton = notDisplayedButtons.eq(i),
            notDisplayedButtonIndex = notDisplayedButton.data('index');
        if(i===0 && layerButtonIndex < notDisplayedButtonIndex){
          notDisplayedButton.before(layerButton);
          break;
        // else, if button index is greater than the largest, insert at end
        }else if(i===notDisplayedButtonsCount - 1 && layerButtonIndex > notDisplayedButtonIndex){
          notDisplayedButton.after(layerButton);
          break;
        // else, insert button before next-largest button index
        }else if(layerButtonIndex < notDisplayedButtonIndex){
          notDisplayedButton.before(layerButton);
          break;
        // else, if loop gets to end and hasn't broken, something's wrong
        }else if(i===notDisplayedButtonsCount -1 && layerButtonIndex <= notDisplayedButtonIndex){
          console.log("WARNING: something's wrong with removeLayerButton()")
        }
      }

    },

    showSummary: function(mapId, summaryContent){
      $('.sidebar-panel:first').append(
        $('<div></div>').addClass('layer-summary')
                        .attr('data-id', mapId)
                        .append(summaryContent)
      );
    },

    removeSummary: function(mapId){
      $('.sidebar-panel:first .layer-summary[data-id="' + mapId + '"]').remove();
    },

    addGrid: function(mapId, gridTemplate){
      var tilejson = {
        "tilejson":"2.1.0",
        "grids":["http://grids.osm.moabi.org/grids/" + mapId + "/{z}/{x}/{y}.json"],
        "template":gridTemplate
      };
      moabi.gridLayer = L.mapbox.gridLayer(tilejson).addTo(moabi.map),
      moabi.gridControl = L.mapbox.gridControl(moabi.gridLayer).addTo(moabi.map);
    },

    clearGrids: function(){
      if (moabi.gridLayer){
        moabi.map.removeLayer(moabi.gridLayer);
      }
      $('.map-tooltip').remove();
    },

    // event handlers that trigger changeLayer event //
    layerButtonClick: function(e){
      e.preventDefault();
      e.stopPropagation();

      $('#map').trigger('changeLayer', $(this).parent('li').data('id'));
    },

    // additional event handlers that interact with map //
    reorderLayers: function(){
      moabi.setLayersZIndex();
      moabi.clearGrids();
      moabi.leaflet_hash.trigger('move');

      var topMapLayerId = moabi.getDisplayedLayers().first().data('id'),
          layerJSON = moabi.getLayerJSON(topMapLayerId);
      moabi.addGrid(topMapLayerId, layerJSON.template);
    },

    setLayersZIndex: function(){
      var layerButtons = moabi.getDisplayedLayers(),
          numLayers = layerButtons.length;

      $.each(layerButtons, function(index, button){
        var mapLayer = mapLayers.dataLayers[$(button).data('id')];
        mapLayer.setZIndex(numLayers - index);
      });
    },

    getDisplayedLayers: function(){
      return $('.layer-ui ul.displayed li.layer-toggle');
    },

    mapCapture: function(e) {
        e.preventDefault();
        e.stopPropagation();

        leafletImage(moabi.map, function(err, canvas) {
            var $imgContainer = $('#images'),
                download = document.getElementById('map-download');

            var mapCapture = document.createElement('img');
            mapImage = canvas.toDataURL();
            download.href = mapImage;
            mapCapture.src = mapImage;
            $imgContainer.children('img').remove();
            $imgContainer.append(mapCapture);
        });
    },

    fade2Page: function(e) {
        // on link click, fade page out, then follow link
        e.preventDefault();
        var newPage = this.href;

        $('body').fadeOut(500, function(){
            window.location = newPage;
        });

    },

    updateExportLink: function(hash) {
      // update map embed link and iD edit link
      $('#map-embed').val("<iframe src='//{{site.baseurl}}/embed/" + hash + "' frameborder='0' width='900' height='700'></iframe>");

      if ($('#id-edit')) {
        var z_lat_lon = hash.split('&')[0].split('/'),
            zoom = z_lat_lon[0].replace("#", ""),
            lat = z_lat_lon[1],
            lon = z_lat_lon[2];

        $('#id-edit').attr('href', '//osm.moabi.org/edit?editor=id#map=' + zoom + '/' + lat + '/' + lon)
      }
    },

    // report editing event handlers
    slidePanel: function(e) {
        var $this = $(this),
            tabgroup = $this.parents('.tab-group'),
            index = $this.data('index'),
            oldIndex = $(this).siblings('.active').removeClass('active').data('index'),
            slidecontainer = tabgroup.next();

        $this.addClass('active');
        slidecontainer.removeClass('active' + oldIndex).addClass('active' + index);
        return false;
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

        var container = $this.parent(),
            index = $this.data('index'),
            nav = $this.data('nav'),
            layers = $this.data('id');
            if(nav){
                moabi.map.setView([nav[0], nav[1]], nav[2]);
            }
            // add layers only after map.setView has completed, via a callback?
            if(layers){
                moabi.removeAllExcept(layers);

                $not_displayed = $('.layer-ui .not-displayed a');

                for(i=0; i<layers.length; i++){
                    layer_button = $not_displayed.filter('[data-id="' + layers[i] + '"]');

                    if(layer_button.length){
                        layer_button.trigger('click');
                    }
                }
            }else{
                moabi.removeAllExcept([]);
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

    removeAllExcept: function(layers) {
      var displayedLayers = moabi.getDisplayedLayers();
      displayedLayers.each(function(i){
        if(! layers.indexOf(displayedLayers[i]) === -1){
          $('#map').trigger('changeLayer', displayedLayers.data('id'));
        }
      });
    },

    // leaflet hash functions //
    setLayerHash: function(hash) {
      var mapIds =  $.map(moabi.getDisplayedLayers(), function(el, i){
        return $(el).data('id')
      });
      return moabi.setQueryVariable(hash, "layers", mapIds.join(','));
    },

    getLayerHash: function() {
      var layers = moabi.getQueryVariable(location.hash, "layers");
      if (layers) { layers = layers.split(','); }
      moabi.removeAllExcept([]); //could be smarter
      for (i = layers.length-1; i >= 0; i--){
        $('#map').trigger('changeLayer', layers[i]);
      }
    },

    getQueryVariable: function(hash, variable) {
      var vars = hash.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
      }
      return(false);
    },

    setQueryVariable: function(hash, key, value) {
      var vars = hash.split("&");
      var found = false;
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == key){
          vars[i] = key + "=" + value;
          found = true;
        }
      }
      if (! found) { vars.push(  key + "=" + value ); }
      return(vars.join("&"));
    },

    showRow: function(e){
      e.stopPropagation();

      var $this = $(this);

      $this.toggleClass('active');
      $this.parent('tr').siblings('tr.' + $this.data('feature')).toggleClass('active');
    },

    textScroll: function(e){
      var target = $( $(this).attr('href') );
      if( target.length ) {
          //e.preventDefault();
          $('html, body').animate({
              scrollTop: target.offset().top - 20
          }, 400);
      }
    }

};

window.moabi = moabi;

})(window);

moabi.global();
