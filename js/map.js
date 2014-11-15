---
---
;(function(context) {
var moabi = {
  common: function() {
    $('header .dropdown').on('click', 'a.dropdown-button', this.headerDropdown);
    $('a.print-page').on('click', this.printPage);
  },

  initMap: function() {
    this.buildMap();
    $('#map').on('changeLayer', this.changeLayer);
    $('.layer-ui li.layer-toggle').on('click', 'a', this.layerButtonClick);
    $('.sortable').sortable({
      placeholder: "ui-state-highlight",
      helper: 'clone',
      update: function(event, ui){
        var displayedButtonContainer = $(this),
            newTopButtonId = displayedButtonContainer.children('li:first').data('id'),
            movedButtonId = ui.item.data('id'),
            movedButtonJSON = moabi.getLayerJSON(newTopButtonId);

        // always show movedLayer summary
        moabi.showSummary(movedButtonId, movedButtonJSON);

        // unless new top button is the same as the old top button, add grids of new topButton
        if(newTopButtonId !== moabi.getLayers()[0]){
          moabi.clearGrids();
          moabi.addGrid(newTopButtonId, moabi.getLayerJSON(newTopButtonId));
        }
        orderedButtonIds = $.map(moabi.getDisplayedLayersButtons(), function(button, index){
          return $(button).data('id')
        }).reverse();
        moabi.setLayersZIndices(orderedButtonIds);
        moabi.leaflet_hash.trigger('move');
      }
    });
    $('.slider').on('click', 'a', this.slidePanel);
    $('#snap').on('click', this.mapCapture);
    $('.page-fade-link').on('click', this.fade2Page);
  },

  initReport: function() {
    $('.report-panel section').waypoint(this.reportScroll, {
      context: '.report-panel',
      offset: '80%'
    });
    $('.navigate').on('click', 'a', this.navigate);
  },

  initDocumentation: function(){
    $('.show-opt-row').on('click', this.showRow);
    $('a[href^="#"]').on('click', this.textScroll);
  },

  // common event handlers
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

  // map event handlers and helper functions
  layerButtonClick: function(e){
    e.preventDefault();
    e.stopPropagation();

    $('#map').trigger('changeLayer', $(this).parent('li').data('id'));
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

  fade2Page: function(e) {
    // on link click, fade page out, then follow link
    e.preventDefault();
    var newPage = this.href;

    $('body').fadeOut(500, function(){
        window.location = newPage;
    });

  },

  buildMap: function(){
    L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXMtbGFuZS1jb25rbGluZyIsImEiOiJ3RHBOc1BZIn0.edCFqVis7qgHPRgdq0WYsA';
    moabi.map = L.mapbox.map('map', undefined, {
      layers: [mapLayers.baseLayer.id],
      center: mapLayers.baseLayer.latlon,
      zoom: mapLayers.baseLayer.zoom,
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 18
    });

    // building L.mapbox.map with an undefined layer creates an extra, empty .leaflet-layer, so delete it.
    var leafletLayers = $(moabi.map._tilePane).children('.leaflet-layer');
    leafletLayers.eq(1).remove();

    // assign explicit z-index to base layer
    mapLayers.baseLayer.id.setZIndex(-1);

    moabi.map.zoomControl.setPosition('topleft');
    moabi.leaflet_hash = L.hash(this.map);

    moabi.map.legendControl.addLegend('<h3 class="center keyline-bottom">Legend</h3><div class="legend-contents"></div>');

    moabi.leaflet_hash.on('update', moabi.getLayerHash);
    moabi.leaflet_hash.on('change', moabi.setLayerHash);
    moabi.leaflet_hash.on('hash', moabi.updateExportLink);
    moabi.updateExportLink(location.hash);
  },

  // changeLayer() and subsidiary functions, triggered on changeLayer Event //
  changeLayer: function(e, mapId){
    // initiate everything that should happen when a map layer is added/removed
    // triggered by custom event 'changeLayer'

    // alias tileLayer in mapLayers, if not already
    if(! mapLayers.dataLayers[mapId]){
      mapLayers.dataLayers[mapId] = L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png');
    }
    var tileLayer = mapLayers.dataLayers[mapId];

    // if layer is present, run all remove layer actions
    if(moabi.map.hasLayer(tileLayer)){
      var layers = moabi.getLayers();
      // run all remove layer actions
      moabi.map.removeLayer(tileLayer);
      moabi.removeLayerButton(mapId);
      moabi.removeLegend(mapId);
      moabi.removeSummary();

      // if removed layer was highest layer, clear grids
      if(mapId === layers[layers.length -1]){
        moabi.clearGrids();
        // if 1+ more layers on map, add grid of the new top layer
        if(layers.length > 1){
          var nextLayerId = layers[layers.length -2];

          if(! layerJSON ) return false;
          moabi.addGrid(nextLayerId, moabi.getLayerJSON(nextLayerId));
        }
      }
    }else{
      // run all add layer actions:
        // add layer to map; add legend; move layer-ui button
        // show description summary; add grid; update hash
      var layerJSON = moabi.getLayerJSON(mapId);
      if(! layerJSON ) return false;

      // find zIndex of current top layer, or -1 if no current layers
      var layers = moabi.getLayers(),
          topLayerZIndex = moabi.getLayerZIndex(layers[layers.length -1])
      moabi.map.addLayer(tileLayer);
      tileLayer.setZIndex(topLayerZIndex + 1);

      moabi.showLayerButton(mapId);
      moabi.showLegend(mapId, layerJSON);
      moabi.showSummary(mapId, layerJSON);
      // not very smart: simply remove all grids and add for the new layer
      moabi.clearGrids();
      moabi.addGrid(mapId, layerJSON);
    }
    moabi.leaflet_hash.trigger('move');
  },

  getLayerJSON: function(mapId){
    var layerJSON;
    $.ajax('{{site.baseurl}}/map_layers.json', {
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success: function(returnedJSON){
        layerJSON = returnedJSON;
      },
      async: false,
      error: function(jqXHR, textStatus, errorThrown){
        console.log("ajax load layerJSON ERROR: ", errorThrown);
        return false;
      }
    });

    return layerJSON[mapId];
  },

  getLayers: function(){
    // return an array of mapIds ordered by zIndex from lowest to highest
    // it is not guaranteed that a mapId's index in the array matches its zIndex
    var dataLayers = mapLayers.dataLayers,
        layersSortedByZIndex = [];

    for(mapId in dataLayers){
      var tileLayer = dataLayers[mapId];
      if(moabi.map.hasLayer(tileLayer)){
        layersSortedByZIndex[tileLayer.options.zIndex] = mapId;
      }
    }
    return layersSortedByZIndex.filter(function(n){
      return n != undefined;
    });
  },

  getLayerZIndex: function(mapId){
    // return mapId zIndex, or -1 if dataLayers doesn't contain mapId
    // var zIndex = mapLayers.dataLayers[mapId].options.zIndex;
    // return zIndex ? zIndex : -1;
    if(mapLayers.dataLayers[mapId]){
      return mapLayers.dataLayers[mapId].options.zIndex;
    }
    return -1;
  },

  setLayerZIndex: function(mapId, zIndex){
    mapLayers.dataLayer[mapId].setZIndex(zIndex);
  },

  setLayersZIndices: function(mapIds){
    // set zIndex for each mapId in array mapIds, arranged from lowest to highest
    for(var i=0; i<mapIds; i++){
      moabi.setLayerZIndex(mapIds[i], i);
    }
  },

  getDisplayedLayersButtons: function(){
    // return a jQuery object containing all layer buttons, sorted from bottom to top
    return $('.layer-ui ul.displayed li.layer-toggle');
  },

  getNotDisplayedLayersButtons: function(){
    return $('.layer-ui ul.not-displayed li.layer-toggle');
  },

  removeAllExcept: function(keepLayers) {
    // removes all layers from map, except for keepLayers (pass as array)
    // returns a list of removed layers
    var displayedLayers = moabi.getLayers();
    return $.map(displayedLayers, function(removeLayer, index){
              moabi.keepLayers = keepLayers;
              moabi.removeLayer = removeLayer;

              if( keepLayers.indexOf(removeLayer) === -1){
                $('#map').trigger('changeLayer', removeLayer);
                return removeLayer;
              }
            });
  },

  showLayerButton: function(mapId){
    // move layerButton from .not-displayed to .displayed
    var layerButton = moabi.getNotDisplayedLayersButtons().filter('[data-id="' + mapId + '"]'),
        displayed = $('.layer-ui .displayed');

    layerButton.addClass('active').prependTo(displayed);
  },

  removeLayerButton: function(mapId){
    // move layerButton from .displayed to where it was originally located in .not-displayed
    var layerButton = moabi.getDisplayedLayersButtons().filter('[data-id="' + mapId + '"]').removeClass('active'),
        layerButtonIndex = layerButton.data('index'),
        notDisplayedButtons = moabi.getNotDisplayedLayersButtons();

    for(i=0; i<notDisplayedButtons.length; i++){
      var notDisplayedButton = notDisplayedButtons.eq(i),
          notDisplayedButtonIndex = notDisplayedButton.data('index');
      // if button index is less than the smallest, insert at beginning
      if(i===0 && layerButtonIndex < notDisplayedButtonIndex){
        notDisplayedButton.before(layerButton);
        break;
      // else, if button index is greater than the largest, insert at end
      }else if(i===notDisplayedButtons.length - 1 && layerButtonIndex > notDisplayedButtonIndex){
        notDisplayedButton.after(layerButton);
        break;
      // else, insert button before next-largest button index
      }else if(layerButtonIndex < notDisplayedButtonIndex){
        notDisplayedButton.before(layerButton);
        break;
      // else, if loop gets to end and hasn't broken, something's wrong
      }else if(i===notDisplayedButtons.length -1 && layerButtonIndex <= notDisplayedButtonIndex){
        console.log("WARNING: something's wrong with removeLayerButton()")
      }
    }

  },

  showLegend: function(mapId, layerJSON){
    $('<div>', {
                'class': 'moabi-legend',
                'data-id': mapId,
                html: layerJSON.legend
    }).prependTo('.map-legend .legend-contents');
  },

  reorderLegend: function(mapId, position){
    var legendContents = $('.legend-contents'),
        layerLegend = legendContents.children('.moabi-legend[data-id="' + mapId + '"]');

    legendContents.prepend(layerLegend);
  },

  removeLegend: function(mapId){
    $('.map-legend .moabi-legend[data-id="' + mapId + '"]').remove();
  },

  showSummary: function(mapId, layerJSON){
    // remove existing summary, if exists
    moabi.removeSummary();
    var summary = ['<ul data-id="', mapId, '" class="layer-summary small keyline-all pad0x space-bottom2">',
      '<li class="pad0">', '<h3>', layerJSON.name, '</h3>', '</li>',
      '<li class="pad0 keyline-bottom">', layerJSON.description, '</li>',
      '<li class="pad0 keyline-bottom space">',
        '<strong class="quiet">Source: </strong>', //insert source_name and optionally source_url here
      '</li>',
      '<li class="pad0 space">',
        '<strong class="quiet">Date:</strong> ',
        '<span class="micro', layerJSON.date, '</span>',
      '</li>',
    '</ul>'];

    if(layerJSON.source_url){
      var urlHTML = ['<a href="', layerJSON.source_url, '" class="micro">',
        layerJSON.source_name, '</a>']
    }else{
      var urlHTML = ['<span class="micro">', layerJSON.source_name, '</span>'];
    }
    summary.splice(13, 0, urlHTML.join(''));

    $('.layer-ui').append(summary.join(''));
  },

  removeSummary: function(){
    $('.layer-ui ul.layer-summary').remove();
  },

  addGrid: function(mapId, layerJSON){
    if(! layerJSON.template){ return false; }
    var tilejson = {
      "tilejson":"2.1.0",
      "grids":["http://grids.osm.moabi.org/grids/" + mapId + "/{z}/{x}/{y}.json"],
      "template":layerJSON.template
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

  // leaflet hash functions
  setLayerHash: function(hash) {
    return moabi.setQueryVariable(hash, "layers", moabi.getLayers().join(','));
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

  // report event handlers
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
          $('#map').trigger('changeLayer', newLayers[i]);
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

  // documentation event handlers
  showRow: function(e){
    e.stopPropagation();

    var $this = $(this);

    $this.toggleClass('active');
    $this.parent('tr').siblings('tr.' + $this.data('feature')).toggleClass('active');
  },

  textScroll: function(e){
    var target = $( $(this).attr('href') );
    if( target.length ) {
      $('html, body').animate({
          scrollTop: target.offset().top - 20
      }, 400);
    }
  }

};

window.moabi = moabi;

})(window);

moabi.common();
