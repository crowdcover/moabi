---
---
{% include js/jquery-1.10.2.min.js %}
{% include js/jquery-ui-1.10.4.custom.min.js %}
{% include js/waypoints.min.js %}
{% include js/leaflet-image.js %}
{% include js/leaflet-hash.js %}

;(function(context) {
  var moabi = {
    global: function() {
      this.initMap();
      $('.map-interaction').on('click', this.mapInteract);
      $('.slider').on('click', 'a', this.slidePanel);
      $('.report-panel section').waypoint(this.reportScroll, {
        context: '.report-panel',
        offset: '80%'
      });
      $('.minor-panel-viewer').on('click', 'a.layer-toggle', this.showMinorPanel);
      $('.layer-ui').on('click', 'a.layer-toggle', this.layerUi);
      $('.navigate').on('click', 'a', this.navigate);
      $('.moabi-legend').appendTo('.map-legend');

      $('.page-fade-link').on('click', this.fade2Page);

      $('#snap').on('click', this.mapCapture);
      $('.sortable').sortable({
        placeholder: "ui-state-highlight",
        update: function( event, ui ){
          ui['item'].siblings('li').addBack().each(function(index) {
                    // this is repetitive.  how to calculate w/o two queries?
                    var numLayers = ui['item'].siblings('li').addBack().length,
                    mapId = ui['item'].children('a').data('id'),
                    layer = mapLayers.dataLayers[mapId][0];

                    layer.setZIndex(numLayers - index);
                    //console.log(numLayers - index + " : " + $(this).children('a').text() );

                  });
          moabi.setGrid(moabi.map);
          moabi.leaflet_hash.trigger('move');
                //console.log("----");
              }
            });
      $( ".sortable" ).disableSelection();
      this.leaflet_hash.on('update', moabi.getLayerHash);
      this.leaflet_hash.on('change', moabi.setLayerHash);
      this.leaflet_hash.on('hash', moabi.updateExportLink);
      moabi.updateExportLink(location.hash);
      $('.not-displayed').css('height', function(){
        totalHeight = 2;
        $('.not-displayed').children('li').each(function(){
          totalHeight += $(this).outerHeight();
        });
        return totalHeight;
      });
    },

    initMap: function(){
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
    },

    mapInteract: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var $this = $(this);

      if($this.data('nav')){
        var location = $this.data('nav');
        var latLon = [location[0],location[1]],
        zoom = location[2];

        moabi.map.setView(latLon, zoom);
      } else if ($this.data('layer-toggle')){

      }
    },

    mapCapture: function(e) {
      e.preventDefault();
      e.stopPropagation();

      leafletImage(moabi.map, function(err, canvas) {
        var $imgContainer = $('#images'),
        download = document.getElementById('map-download');

        var mapCapture = document.createElement('img');
            // var dimensions = map.getSize();
            //img.width = dimensions.x;
            //img.height = dimensions.y;
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

      slidePanel: function() {
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
          layerUi: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var $this = $(this),
            $thisIndex = $this.parent('li').data('index'),
            displayed = $('.layer-ui .displayed'),
            notDisplayed = $('.layer-ui .not-displayed');

            mapId = $this.data('id');

            if (! mapLayers.dataLayers[mapId]){
              mapLayers.dataLayers[mapId] = [
              L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png'),
              $('.moabi-legend[data-id="' + mapId + '"]')
              ];
            }

            var layer = mapLayers.dataLayers[mapId][0];
            layerLegend = mapLayers.dataLayers[mapId][1];

        // if button is active, remove layer from map and move button to notDisplayed
        if ($this.hasClass('active')) {
          $this.removeClass('active');
          moabi.map.removeLayer(layer);
          layerLegend.removeClass('active');

            // find all indices in notDisplayed
            var notDisplayedIndices = notDisplayed.children('li').map(function(){
              return $(this).data('index');
            }).get().sort(function (a, b) { return a - b; });

            // if nodisplay is empty OR if $thisIndex greater than the largest nodisplay index, append to end
            if (notDisplayedIndices.length === 0 || $thisIndex > notDisplayedIndices[notDisplayedIndices.length - 1]){
              notDisplayed.append($this.parent('li'));
            // if $thisIndex less than the smallest nodisplay Index, prepend to beginning
          } else if ($thisIndex < notDisplayedIndices[0]){
            notDisplayed.prepend($this.parent('li'));
            // else, find next smallest
          } else {
            for (i = 0; i < notDisplayedIndices.length; i++){
              if (notDisplayedIndices[i] > $thisIndex){
                nextLargestIndex = notDisplayedIndices[i - 1];
                break;
              }
            }

            notDisplayed.children('li').filter('[data-index="' + nextLargestIndex + '"]').after($this.parent('li'));
          }

        // else if button is not active: add layer to map and move button to displayList
      } else {
        $this.addClass('active');
        displayed.prepend($this.parent('li'));
        moabi.map.addLayer(layer);

        layerLegend.addClass('active');
      }
      moabi.setGrid(moabi.map);
      moabi.leaflet_hash.trigger('move');
    },

    showMinorPanel: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var $this = $(this),
      panelId = $(this).data('id');

      if ($this.hasClass('active')) {
            // close the active panel and open the previous one
            var minorPanel = $('.minor-panel[data-id="' + panelId + '"]');

            if (minorPanel.hasClass('active')) {
              minorPanel.removeClass('active');
              var nextInLine = $this.closest('li').siblings('li').children('a.active:last').data('id');
              if (nextInLine) {
                $('.minor-panel[data-id="' + nextInLine + '"]').addClass('active');
              }
            }
          } else {
            // close any active panel and open the new one
            $('.minor-panel.active').removeClass('active');
            $('.minor-panel[data-id="' + panelId + '"]').addClass('active');
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
          $('.layer-ui .displayed .layer-toggle').each(function(){
            var $this = $(this);

            if(layers.indexOf($this.data('id')) === -1){
              $this.trigger('click');
            }
          });
        },

        setGrid: function(map) {
          try {
        // get moabi_id and tooltip of first item in the displayed list, and build a tooltip template
        var layerListItem = $('.layer-ui .displayed li:first a'),
        grid_url = "http://grids.osm.moabi.org/grids/" + layerListItem.data('id') + "/{z}/{x}/{y}.json",
        teaserTooltip = layerListItem.data('tooltip-teaser'),
        fullTooltip = layerListItem.data('tooltip-full'),
        teaserTemplate = "",
        fullTemplate = "";
        $.each(teaserTooltip, function(idx, attr){
          teaserTemplate += "<div class='tooltip-attribute'> <span class='key'>" + attr.replace('_', ' ') + "</span>: \{\{" + attr + "\}\}</div>";
        });
        teaserTemplate += "<span class='micro quiet caps'>click for more feature information</span>"
        $.each(fullTooltip, function(idx, attr){
          fullTemplate += "<div class='tooltip-attribute'> <span class='key'>" + attr.replace('_', ' ') + "</span>: \{\{" + attr + "\}\}</div>";
        });
        fullTemplate += "<div><a href='http://osm.moabi.org/edit?way=\{\{osm_id\}\}' class='quiet small'>Edit in iD</a></div>";
        fullTemplate += "<div><a href='http://osm.moabi.org/way/\{\{osm_id\}\}/history' class='quiet small'>View History</a></div>";
      } catch(err) { console.log(err); return; }

      // for each loaded tile layer, remove
      var present = false;
      map.eachLayer(function (layer) {
        if (layer.options['grids']) {
          if (layer.options.grids[0] == grid_url) { present = true; } //grid already loaded
          else {
            map.removeLayer(layer);
            $('.map-tooltip').each( function() { $(this).remove(); } );
          }
        }
      });

      // add grid if it's not present and if at least one of teaserTooltip or fullTooltip is not empty
      if (!present && (teaserTooltip.length > 0 || fullTooltip.length)) {
        var tilejson = {
          "tilejson":"2.1.0",
          "grids":[grid_url],
          "template":"\{\{#__teaser__\}\}" + teaserTemplate + "{\{/__teaser__\}\}" +
          "\{\{#__full__\}\}" + fullTemplate + "{\{/__full__\}\}"
        };
        moabi.gridLayer = L.mapbox.gridLayer(tilejson).addTo(map),
        moabi.gridControl = L.mapbox.gridControl(moabi.gridLayer).addTo(map);
      }
    },

    setLayerHash: function(hash) {
      var displayed = $('.layer-ui .displayed');
      var mapids = [];
      for (var x = 0; x < displayed[0].children.length; x++) {
        mapids.push($(displayed[0].children[x]).children('a').data('id'));
      }
      return moabi.setQueryVariable(hash, "layers", mapids.join(','));
    },

    getLayerHash: function() {
      var layers = moabi.getQueryVariable(location.hash, "layers");
      if (layers) { layers = layers.split(','); }
      moabi.removeAllExcept([]); //could be smarter
      for (i = layers.length-1; i >= 0; i--){
        $('.layer-ui .layer-toggle[data-id="' + layers[i] + '"]').trigger('click');
      }
    },

    updateExportLink: function(hash) {
      // update map embed link and iD edit link
      if ($('#map-embed')[0]) {
        $('#map-embed')[0].value = "<iframe src='http://rdc.moabi.org/embed/" + hash + "' frameborder='0' width='900' height='700'></iframe>";
      }

      if ($('#id-edit')) {
        z_lat_lon = hash.split('&')[0].split('/')
        var zoom = z_lat_lon[0].replace("#", ""),
        lat = z_lat_lon[1],
        lon = z_lat_lon[2];

        $('#id-edit').attr('href', 'http://osm.moabi.org/edit?editor=id#map=' + zoom + '/' + lat + '/' + lon)
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
  };

  window.moabi = moabi;

})(window);

moabi.global();
