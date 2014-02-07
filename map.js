---
---
{% include js/jquery-1.10.2.min.js %}


var map = L.mapbox.map('map', undefined, {
    //legendControl: true,
    shareControl: true,

})
    .setView(page_data.baseLayer.latlon, page_data.baseLayer.zoom);

map.zoomControl.setPosition('topright');
map.shareControl.setPosition('topright');

//build base layer
for(i = 0; i < page_data.baseLayer["id"].length; i++){
    // L.mapbox.tileLayer(page_data.baseLayer["id"][i][0], { zIndex: page_data.baseLayer["id"][i][1] }).addTo(map);
    L.tileLayer('http://tiles.osm.moabi.org/' + page_data.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(map);
}

//map.legendControl.addLegend(document.getElementById('legend-content').innerHTML);
map.legendControl.addLegend('<div></div>');


(function(context) {
var moabi = {

    currentLanguage: 'en',

    init: function() {
        $(document).ready(this.contentBarResize);
        $(window).resize(this.contentBarResize);

        $('.boxmenu').on('click', 'a', this.showMajorPanel);
        $('.minor-panel-viewer').on('click', 'a', this.showMinorPanel);
        $('.navigate').on('click', 'a', this.navigate);
        $('.toggle-layer').on('click', 'a', this.toggleLayer);
        $('.toggle-language').on('click', 'a', this.toggleLanguage);
        $('.moabi-legend').appendTo('.map-legend');
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

        $this = $(this);

        var lat = $this.data("nav")[0];
        var lon = $this.data("nav")[1];
        var zoom = $this.data("nav")[2];
        map.setView([lat, lon], zoom);

        $this.parent('li').siblings('li').children('a.active').removeClass('active');
        $this.addClass('active');
    },

    toggleLayer: function(e) {
        e.preventDefault();
        e.stopPropagation();

        $this = $(this);

        var mapId = $this.data('mapid'),
            elementId = $this.attr('id');

        if (! page_data.dataLayers[elementId]){
            //page_data.dataLayers[elementId] = L.mapbox.tileLayer(mapId);
            // page_data.dataLayers[elementId] = L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png');
            page_data.dataLayers[elementId] = [
                L.tileLayer('http://tiles.osm.moabi.org/' + mapId + '/{z}/{x}/{y}.png'),
                $('.' + elementId + '-legend')
            ];
        }

        var layer = page_data.dataLayers[elementId][0];
        var layerLegend = page_data.dataLayers[elementId][1];

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            $this.removeClass('active');
            layerLegend.hide();

        } else {
            map.addLayer(layer);
            $this.addClass('active');
            layerLegend.show();
        }
    },

    toggleLanguage: function(e) {
        e.preventDefault();
        e.stopPropagation();

        $this = $(this)

        if($this.data('lang') == 'en' && moabi.currentLanguage != 'en'){
            moabi.currentLanguage = 'en';
            console.log("view englishLayers");

            $this.addClass('active').siblings('.active').removeClass('active');

            // map.removeLayer(chineseLayers.labels);
            // map.removeLayer(chineseLayers.dams_grid);

            // map.addLayer(englishLayers.labels);
            // map.addLayer(englishLayers.dams_grid);
        }else if($this.data('lang') == 'fr' && moabi.currentLanguage != 'fr'){
            moabi.currentLanguage = 'fr';
            console.log("view frenchLayers");

            $this.addClass('active').siblings('.active').removeClass('active');

            // map.removeLayer(englishLayers.labels);
            // map.removeLayer(englishLayers.dams_grid);

            // map.addLayer(chineseLayers.labels);
            // map.addLayer(chineseLayers.dams_grid);
        }else{
            console.log("nope");
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

window.moabi = moabi;

})(window);



// function addRadioButton(mapId, elementId) {
//     var layer = L.mapbox.tileLayer(mapId);

//     $('#' + elementId).on('click', function(e) {
//         e.preventDefault();
//         e.stopPropagation();

//         if (map.hasLayer(layer)) {
//             map.removeLayer(layer);
//             $(this).removeClass('active');
//         } else {
//             map.addLayer(layer);
//             $(this).addClass('active');

//             $(this).closest('div').children('.minor-panel.active').removeClass('active');
//             $('#' + elementId + '-panel').addClass('active');

//             moabi.contentBarResize();
//         }
//     });
// }

// // bind all handlers to their elements
// addRadioButton('helsinki.moabi_transport', 'transport');
// addRadioButton('helsinki.moabi_logging', 'logging');
// addRadioButton('helsinki.moabi_mining', 'mining');
// addRadioButton('helsinki.moabi_oil', 'oil');
// addRadioButton('helsinki.moabi_palm', 'palm');
// addRadioButton('helsinki.moabi_indigenous', 'indigenous');
// addRadioButton('helsinki.moabi_energy', 'energy');

// map zoom-to navigation buttons
// function navigate(elementId, latlonzoom) {
//     $('#' + elementId).on('click', function(e) {
//         e.preventDefault();
//         e.stopPropagation();

//         var location = latlonzoom.split(',');
//         var latLon = [location[0],location[1]];
//         var zoom = location[2];
//         map.setView(latLon, zoom);

//         // $(this).parent('li').siblings('li').children('a.active').removeClass('active');
//         // $(this).addClass('active');
//     });
// }

// navigate('era', '-2,18,8');
// navigate('luki', '-5.6,13.2,8');
// navigate('tayna', '-0.35,28.74,8');
// navigate('kwamouth', '-3.9,16.6,8');
// navigate('ecomakala', '-1,29.3,8');
// navigate('mambasa', '1.1,29.1,8');
// navigate('isangi', '0.9,24.1,8');
// navigate('mitsoshi', '-5.1,29.1,8');
// navigate('jadora', '0.4,23.95,8');

//set content-bar height
//also consider using max-height: calc(100% - 90px) [mind compatibility issues ]
//http://stackoverflow.com/questions/2434602/css-setting-width-height-as-percentage-minus-pixels



