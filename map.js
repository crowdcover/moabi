---
---
{% include js/jquery-1.10.2.min.js %}
{% include js/jquery-ui-1.10.4.custom.min.js %}


;(function(context) {
// if project map
if (mapLayers.pageType == 'project'){
    this.map = L.mapbox.map('map', undefined, {
        scrollWheelZoom: false
    });

    this.map.setView(mapLayers.baseLayer.latlon, mapLayers.baseLayer.zoom);
    this.map.zoomControl.setPosition('topright');
    var hash = L.hash(this.map);

    //build base layer
    for(i = 0; i < mapLayers.baseLayer["id"].length; i++){
        L.tileLayer('http://tiles.osm.moabi.org/' + mapLayers.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(this.map);
    }
// otherwise, (landing page, blog, etc...)
} else {
    this.map = L.mapbox.map('map', undefined, {
        scrollWheelZoom: false
    });

    this.map.zoomControl.setPosition('topright');
    this.map.setView(mapLayers.baseLayer.latlon, mapLayers.baseLayer.zoom);

    //build base layer
    for(i = 0; i < mapLayers.baseLayer["id"].length; i++){
        L.tileLayer('http://tiles.osm.moabi.org/' + mapLayers.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(this.map);
    }
}

document.getElementById('snap').addEventListener('click', function() {
    leafletImage(map, doImage);
});

function doImage(err, canvas) {
    console.log('do Image fired: this=' + this);
    var img = document.createElement('img');
    var dimensions = map.getSize();
    img.width = dimensions.x;
    img.height = dimensions.y;
    img.src = canvas.toDataURL();
    document.getElementById('images').innerHTML = '';
    document.getElementById('images').appendChild(img);
}

var moabi = {

    global: function() {
        // $(document).ready(this.contentBarResize);
        // $(window).resize(this.contentBarResize);

        $('.boxmenu').on('click', 'a', this.showMajorPanel);
        $('.minor-panel-viewer').on('click', 'a', this.showMinorPanel);
        $('.layer-ui').on('click', 'a', this.layerUi);
        $('.toggle-layer').on('click', 'a', this.toggleLayer);
        $('.navigate').on('click', 'a', this.navigate);
        // $('.toggle-language').on('click', 'a', this.toggleLanguage);
        $('.moabi-legend').appendTo('.map-legend').on('click', this.legendToggleLayer);
        $('.slideshow').on('click', '.slide-control', this.imgSlide);

        // $('#snap').on('click', leafletImage(map, moabi.doImage));

        $('.sortable').sortable({
            placeholder: "ui-state-highlight",
            update: function( event, ui ){
                ui['item'].siblings('li').addBack().each(function(index) {
                    // this is repetitive.  how to calculate w/o two queries?
                    var numLayers = ui['item'].siblings('li').addBack().length,
                        mapId = ui['item'].children('a').data('id'),
                        layer = mapLayers.dataLayers[mapId][0];

                    layer.setZIndex(numLayers - index);
                    console.log(numLayers - index + " : " + $(this).children('a').text() );

                });
                console.log("----");
            }
        });
        $( ".sortable" ).disableSelection();
    },

    doImage: function(err, canvas) {
        this.console.log('doImage fired')
        var img = document.createElement('img');
        var dimensions = map.getSize();
        img.width = dimensions.x;
        img.height = dimensions.y;
        img.src = canvas.toDataURL();
        document.getElementById('images').innerHTML = '';
        document.getElementById('images').appendChild(img);
    },

    setLayerZ: function(e) {
        e.preventDefault();
        e.stopPropagation();
    },

    toggleLayer: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            mapId = $this.data('id');

        if (! mapLayers.dataLayers[mapId]){
            mapLayers.dataLayers[mapId] = [
                L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png'),
                $('.moabi-legend[data-id="' + mapId + '"]')
            ];
        }

        var layer = mapLayers.dataLayers[mapId][0],
            layerLegend = mapLayers.dataLayers[mapId][1],
            $mapLegend = $('.map-legend');

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            $this.removeClass('active');

            layerLegend.removeClass('active icon');
            if ($mapLegend.children('.moabi-legend.active').length === 0) {
                $mapLegend.removeClass('active');
            }
            moabi.legendResize();

        } else {
            map.addLayer(layer);
            $this.addClass('active');

            if (! $mapLegend.hasClass('active')) {
                $mapLegend.addClass('active');
            }
            layerLegend.addClass('active icon');
            moabi.legendResize();
        }
    },

    layerUi: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            $thisIndex = $this.parent().data('index'),
            displayedList = $('.layer-ui .displayed'),
            nodisplayList = $('.layer-ui .not-displayed');

            mapId = $this.data('id');

        if (! mapLayers.dataLayers[mapId]){
            mapLayers.dataLayers[mapId] = [
                L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png'),
                $('.moabi-legend[data-id="' + mapId + '"]')
            ];
        }

        var layer = mapLayers.dataLayers[mapId][0],
            layerLegend = mapLayers.dataLayers[mapId][1],
            $mapLegend = $('.map-legend');

        // if button is active, remove layer from map and move button to nodisplayList
        if ($this.hasClass('active')) {
            $this.removeClass('active');
            map.removeLayer(layer);

            // find all indices in nodisplayList
            var nodisplayIndices = nodisplayList.children('li').map(function(){
                return $(this).data('index');
            }).get().sort(function (a, b) { return a - b; });

            // if $thisIndex greater than the largest nodisplay index, append to end
            if ($thisIndex > nodisplayIndices[nodisplayIndices.length - 1]){
                nodisplayList.append($this.parent());
            // if $thisIndex less than the smallest nodisplay Index, prepend to beginning
            } else if ($thisIndex < nodisplayIndices[0]){
                nodisplayList.prepend($this.parent());
            // else, find next smallest
            } else {
                for (i = 0; i < nodisplayIndices.length; i++){
                    if (nodisplayIndices[i] > $thisIndex){
                        nextLargestIndex = nodisplayIndices[i - 1];
                        break;
                    }
                }

                nodisplayList.children('li').filter('[data-index="' + nextLargestIndex + '"]').after($this.parent());
            }

        // else if button is not active: add layer to map and move button to displayList
        } else {
            $this.addClass('active');
            displayedList.prepend($this.parent());
            map.addLayer(layer);
        }
    },

    filterLayers: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            category = $this.data('category');

        $this.siblings('ul.nodisplay').children('li').each(function(){
            $this = $(this)
            if ($this.data('categories').split(',').indexOf(category) == -1) {
                $this.hide()
            }
        });
    },

    legendToggleLayer: function(e) {
        var mapId = $(this).data('id');

        $('.ui-button[data-id="' + mapId + '"]' ).trigger('click');
    },

    showMajorPanel: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            panelId = $this.data('id'),
            sidebar = $this.parents('.sidebar');

        // make button .active
        $this.parents('ul').find('a.active').removeClass('active');
        $this.addClass('active');

        sidebar.find('.main-panel.active').removeClass('active');
        sidebar.find('.main-panel[data-id="' + panelId + '"]').addClass('active');

        moabi.contentBarResize();
    },

    showMinorPanel: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            panelId = $(this).data('id');

        if ($this.hasClass('active')) {
            // close the active panel and open the previous one
            $('.minor-panel[data-id="' + panelId + '"]').removeClass('active');

            var nextInLine = $this.closest('li').siblings('li').children('a.active:last').data('id');
            if (nextInLine) {
                $('.minor-panel[data-id="' + nextInLine + '"]').addClass('active');
            }
        } else {
            // close any active panel and open the new one
            $(this).closest('.main-panel').children('.minor-panel.active').removeClass('active');
            $('.minor-panel[data-id="' + panelId + '"]').addClass('active');
        }

        moabi.contentBarResize();
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

    toggleLanguage: function(e) {
        // e.stopPropagation();

        // $this = $(this);

        // if($this.data('lang') == 'en' && moabi.currentLanguage != 'en') {
        //     moabi.currentLanguage = 'en';
        //     $this.addClass('active').siblings('.active').removeClass('active');

        // } else if($this.data('lang') == 'fr' && moabi.currentLanguage != 'fr') {
        //     moabi.currentLanguage = 'fr';
        //     $this.addClass('active').siblings('.active').removeClass('active');

        // }
    },

    contentBarResize: function() {
        // in order to allow for an animated height transition:
        // calculate height of content-bar's children,
        // calculate max height of content bar based on window size - content-bar's siblings
        // set content-bar height to the smaller of the two
        var $boxmenu = $('.boxmenu'),
            $contentbarFill = $('.contentbar-fill');

        var contentHeight = $contentbarFill.children('.main-panel.active').outerHeight();
        var maxHeight = $(window).height() - $('.contentbar-header').height() - $boxmenu.height() - 3; //minus 3 for border-bottom of .contentbar-fill (2) and .contentbar-header (1)
        if(contentHeight < maxHeight ) {
            $boxmenu.removeClass('shadow');
            $contentbarFill.height(contentHeight);
        } else {
            $boxmenu.addClass('shadow');
            $contentbarFill.height(maxHeight);
        }
    },

    legendResize: function() {
        // set .map-egend height to it's new height every time .moabi-legends are added/removed
        var $mapLegend = $('.map-legend'),
            totalHeight = 0;

        // sum outerHeight of everything not a .moabi-legend [at this point only the h4]
        $mapLegend.children().not('.moabi-legend').each(function() {
            totalHeight += $(this).outerHeight( true );
        });

        // sum outerHeight of every .moabi-legend.active
        $mapLegend.children('.moabi-legend.active').each(function() {
            totalHeight += $(this).outerHeight( true );
        });

        $mapLegend.height(totalHeight);
    },

    imgSlide: function() {
        var $this = $(this),
            slides = $('.slide'),
            activeSlide = slides.filter('.active'),
            slideCount = slides.length - 1;  // subtract 1 for moabi title slide

        activeSlide.removeClass('active');
        if ($this.data('slide') == 'right'){
            var newIndex = parseInt(activeSlide.data('index'), 10) + 1;
            if (newIndex > slideCount){ var newIndex = 0; }
            slides.filter('[data-index="' + newIndex + '"]').addClass('active');
        } else {
            var newIndex = parseInt(activeSlide.data('index'), 10) - 1;
            if (newIndex === -1){ var newIndex = slideCount; }
            slides.filter('[data-index="' + newIndex + '"]').addClass('active');
        }
    }

};

window.moabi = moabi;

})(window);

moabi.global();
