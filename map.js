---
---
{% include js/jquery-1.10.2.min.js %}


var map = L.mapbox.map('map', undefined, {
    shareControl: true
});

map.setView(page_data.baseLayer.latlon, page_data.baseLayer.zoom);
map.zoomControl.setPosition('topright');
map.shareControl.setPosition('topright');

//build base layer
for(i = 0; i < page_data.baseLayer["id"].length; i++){
    L.tileLayer('http://tiles.osm.moabi.org/' + page_data.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(map);
}


(function(context) {
var moabi = {

    init: function() {
        $(document).ready(this.contentBarResize);
        $(window).resize(this.contentBarResize);

        $('.boxmenu').on('click', 'a', this.showMajorPanel);
        $('.minor-panel-viewer').on('click', 'a', this.showMinorPanel);
        $('.navigate').on('click', 'a', this.navigate);
        $('.toggle-layer').on('click', 'a', this.toggleLayer);
        // $('.toggle-language').on('click', 'a', this.toggleLanguage);
        map.legendControl.addLegend('<h3>Data Layers</h3>');
        $('.moabi-legend').appendTo('.map-legend').on('click', this.legendToggleLayer);
    },

    legendToggleLayer: function(e) {
        mapId = $(this).data('id');
        $('.ui-button[data-id="' + mapId + '"]' ).trigger('click');
    },

    showMajorPanel: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var panelId = $(this).data('id');

        // make button .active
        $(this).addClass('active').parent('li').siblings('li').children('a.active').removeClass('active');

        $('.main-panel.active').removeClass('active');
        $('.main-panel[data-id="' + panelId + '"]').addClass('active');

        moabi.contentBarResize();
    },

    showMinorPanel: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);

        if (! $this.hasClass('active')) {
            var panelId = $(this).data('id');

            //close any open panel and open the new one
            $(this).closest('div').children('.minor-panel.active').removeClass('active');
            $('.minor-panel[data-id="' + panelId + '"]').addClass('active');

            moabi.contentBarResize();
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

    toggleLayer: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            mapId = $this.data('id');

        if (! page_data.dataLayers[mapId]){
            page_data.dataLayers[mapId] = [
                L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png'),
                $('.moabi-legend[data-id="' + mapId + '"]')
            ];
        }

        var layer = page_data.dataLayers[mapId][0],
            layerLegend = page_data.dataLayers[mapId][1],
            $mapLegend = $('.map-legend');

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            $this.removeClass('active rcon float layer-toggle');

            layerLegend.removeClass('active icon layer-toggle');
            if ($mapLegend.children('.moabi-legend.active').length === 0) {
                $mapLegend.removeClass('active');
            }

        } else {
            map.addLayer(layer);
            $this.addClass('active rcon float layer-toggle');

            if (! $mapLegend.hasClass('active')) {
                $mapLegend.addClass('active');
            }
            layerLegend.addClass('active icon layer-toggle');
        }
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
        //console.log("contentBarResize fired. Content height: " + $contentbarFill.children('.main-panel.active').outerHeight());
        if(contentHeight < maxHeight ) {
            // console.log("set to contentHeight" + contentHeight);
            $boxmenu.removeClass('shadow');
            $contentbarFill.height(contentHeight);
        } else {
            //console.log("set to maxHeight" + maxHeight + " .window: " + $(window).height() + "header: " + $('.contentbar-header').height() + "boxmenu: " + $boxmenu.height());
            $boxmenu.addClass('shadow');
            $contentbarFill.height(maxHeight);
        }
    }

    // legendResize: function() {
    //     var $mapLegend =
    // }

};

moabi.init();

window.moabi = moabi;

})(window);
