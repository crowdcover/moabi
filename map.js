---
---
{% include js/jquery-1.10.2.min.js %}
{% include js/jquery-ui-1.10.4.custom.min.js %}
{% include js/waypoints.min.js %}
{% include js/leaflet-image.js %}
{% include js/leaflet-hash.js %}

;(function(context) {

this.map = L.mapbox.map('map', undefined, {
    shareControl: true,
    scrollWheelZoom: false
});

this.map.zoomControl.setPosition('topright');
this.map.shareControl.setPosition('topright');
this.map.setView(mapLayers.baseLayer.latlon, mapLayers.baseLayer.zoom);
this.leaflet_hash = L.hash(this.map);

this.map.legendControl.addLegend("<h2 class='center keyline-bottom'>Legend</h2>");

//build base layer
for(i = 0; i < mapLayers.baseLayer["id"].length; i++){
    L.tileLayer('http://tiles.osm.moabi.org/' + mapLayers.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(this.map);
}

var moabi = {

    global: function() {
        $('.map-interaction').on('click', this.mapInteract);
        $('.slider').on('click', 'a', this.slidePanel);
        $('.report-panel section').waypoint(this.reportScroll, {
            context: '.report-panel',
            offset: '90%'
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
                moabi.setGrid(map);
                leaflet_hash.trigger('move');
                //console.log("----");
            }
        });
        $( ".sortable" ).disableSelection();
        leaflet_hash.on('update', moabi.getLayerHash);
        leaflet_hash.on('change', moabi.setLayerHash);
        leaflet_hash.on('hash', moabi.updateExportLink);
        moabi.updateExportLink(location.hash);
        $('.not-displayed').css('height', function(){
            totalHeight = 2;
            $('.not-displayed').children('li').each(function(){
                totalHeight += $(this).outerHeight();
            });
            return totalHeight;
        });
    },

    mapInteract: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);

        if($this.data('nav')){
            var location = $this.data('nav');
            var latLon = [location[0],location[1]],
                zoom = location[2];

            map.setView(latLon, zoom);
        } else if ($this.data('layer-toggle')){

        }
    },

    mapCapture: function(e) {
        e.preventDefault();
        e.stopPropagation();

        leafletImage(map, function(err, canvas) {
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
            var $this = $(this),
                index = $this.data('index'),
                nav = $this.data('nav'),
                layers = $this.data('id');
        }else{
            var $this = $(this).prev(),
                index = $this.data('index'),
                nav = $this.data('nav'),
                layers = $this.data('id');
        }


        console.log("dir:" + dir + " index:" + index + " nav:" + nav + " layers:" + layers);

        if(nav){
            map.setView([nav[0], nav[1]], nav[2]);
        }

        if(layers){
            moabi.removeAllExcept(layers);

            $not_displayed = $('.layer-ui .not-displayed a');

            for(i=0; i<layers.length; i++){
                layer_button = $not_displayed.filter('[data-id="' + layers[i] + '"]');

                if(layer_button.length){
                    layer_button.trigger('click');
                    console.log("add layer: " + layers[i]);
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
            map.removeLayer(layer);
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
            map.addLayer(layer);

            layerLegend.addClass('active');
        }
        moabi.setGrid(map);
        leaflet_hash.trigger('move');
    },

    // filterLayers: function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();

    //     var $this = $(this),
    //         category = $this.data('category');

    //     $this.siblings('ul.nodisplay').children('li').each(function(){
    //         $this = $(this);
    //         if ($this.data('categories').split(',').indexOf(category) == -1) {
    //             $this.hide();
    //         }
    //     });
    // },

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

        map.setView([lat, lon], zoom);

        $this.parent('li').siblings('li').children('a.active').removeClass('active');
        $this.addClass('active');
    },

    removeAllExcept: function(layers) {
        $('.layer-ui .displayed .layer-toggle').each(function(){
            var $this = $(this);

            if(layers.indexOf($this.data('id')) === -1){
                console.log('remove layer: ' + $this.data('id'));
                $this.trigger('click');
            }
        });
    },

    setGrid: function(map) {
      try {
        // get moabi_id and tooltip of first item in the displayed list, and build a tooltip template
        var moabi_id = $($('.layer-ui .displayed')[0].firstChild).children('a').data('id');
        var tooltip = $($('.layer-ui .displayed')[0].firstChild).children('a').data('tooltip');
        var tooltip_list = tooltip.split(',');
        var template = "";
        for (var x in tooltip_list) {
          template = template + "<div class='tooltip-attribute'> <span class='key'>" + tooltip_list[x] + "</span>" + ": \{\{" + tooltip_list[x] + "\}\}</div>";
        }
      } catch(err) { return; }

      var grid_url = "http://grids.osm.moabi.org/grids/" + moabi_id + "/{z}/{x}/{y}.json";

      //
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



      if (tooltip != "" && ! present) {
        var tilejson = {"tilejson":"2.0.0","grids":["http://grids.osm.moabi.org/grids/" + moabi_id + "/{z}/{x}/{y}.json"],"template":"\{\{#__teaser__\}\}" + template + "{\{/__teaser__\}\}"};
        var gridLayer = L.mapbox.gridLayer(tilejson);
        map.addLayer(gridLayer);
        map.addControl(L.mapbox.gridControl(gridLayer));
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
