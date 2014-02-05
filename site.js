---
---
{% include js/jquery-1.10.2.min.js %}


var map = L.mapbox.map('map', undefined, {
    zoomControl: false
})
    .setView(page_data.baseLayer.latlon, page_data.baseLayer.zoom);

//build base layer
for(i = 0; i < page_data.baseLayer["id"].length; i++){
    // L.mapbox.tileLayer(page_data.baseLayer["id"][i][0], { zIndex: page_data.baseLayer["id"][i][1] }).addTo(map);
    L.tileLayer('http://tiles.osm.moabi.org/' + page_data.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(map);
}

(function() {
var moabi = {
    dataLayers: {},

    init: function() {
        $(document).ready(this.contentBarResize);
        $(window).resize(this.contentBarResize);

        // $('.boxmenu').on('click', 'a', this.showMajorPanel);
        // $('.minor-panel-viewer').on('click', 'a', this.showMinorPanel);
        // $('.navigate').on('click', 'a', this.navigate);
        // $('.toggle-layer').on('click', 'a', this.toggleLayer);
    },

    showMajorPanel: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var panelClassName = '.' + $(this).attr('id') + '.main-panel';

        // make button .active
        $(this).addClass('active').parent('li').siblings('li').children('a.active').removeClass('active');

        $('.main-panel.active').removeClass('active');
        $(panelClassName).addClass('active');

        moabi.contentBarResize();
    },

    showMinorPanel: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var panelId = '#' + $(this).attr('id') + '-panel';

        //make button .active
        //$(this).addClass('active').parent('li').siblings('li').children('a.active').removeClass('active');

        //close any open panel and open the new one
        $(this).closest('div').children('.minor-panel.active').removeClass('active');
        $(panelId).addClass('active');

        moabi.contentBarResize();
    },

    navigate: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var lat = $(this).data("nav")[0];
        var lon = $(this).data("nav")[1];
        var zoom = $(this).data("nav")[2];
        // var lat = $(this).data("lat");
        // var lon = $(this).data("lon");
        // var zoom = $(this).data("zoom");
        map.setView([lat, lon], zoom);

        $(this).parent('li').siblings('li').children('a.active').removeClass('active');
        $(this).addClass('active');
    },

    toggleLayer: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var mapId = $(this).data('mapid'),
            elementId = $(this).attr('id');

        if (! moabi.dataLayers[elementId]){
            moabi.dataLayers[elementId] = L.mapbox.tileLayer(mapId);
        }

        var layer = moabi.dataLayers[elementId];

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            $(this).removeClass('active');
        } else {
            map.addLayer(layer);
            $(this).addClass('active');
        }
    },

    contentBarResize: function() {
        // in order to allow for an animated height transition:
        // calculate height of content-bar's children,
        // calculate max height of content bar based on window size - content-bar's siblings
        // set content-bar height to the smaller of the two
        var contentHeight = $('.contentbar-fill').children('.main-panel.active').outerHeight();
        var maxHeight = $(window).height() - $('.contentbar-header').height() - $('.boxmenu').height() - 3; //minus 3 for border-bottom of .contentbar-fill (2) and .contentbar-header (1)
        //console.log("contentBarResize fired. Content height: " + $('.contentbar-fill').children('.main-panel.active').outerHeight());
        if(contentHeight < maxHeight ) {
            // console.log("set to contentHeight" + contentHeight);
            $('.boxmenu').removeClass('shadow');
            $('.contentbar-fill').height(contentHeight);
        } else {
            //console.log("set to maxHeight" + maxHeight + " .window: " + $(window).height() + "header: " + $('.contentbar-header').height() + "boxmenu: " + $('.boxmenu').height());
            $('.boxmenu').addClass('shadow');
            $('.contentbar-fill').height(maxHeight);
        }
    }

};

moabi.init();

})();
