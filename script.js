---
---
{% include js/jquery-1.10.2.min.js %}


var map = L.mapbox.map('map', 'helsinki.moabi_base', {
    //legendControl: true,
    shareControl: true
})
    .setView([-2.877, 22.830], 5);

//add REDD tile layer
L.tileLayer('http://tiles.osm.moabi.org/redd/{z}/{x}/{y}.png').addTo(map);


(function() {
var moabi = {
    dataLayers: {},

    init: function() {
        $(document).ready(this.contentBarResize);
        $(window).resize(this.contentBarResize);

        $('.boxmenu').on('click', 'a', this.showMajorPanel);
        $('.minor-panel-viewer').on('click', 'a', this.showMinorPanel);
        $('.nav-buttons').on('click', 'a', this.navigate);
        $('.data-layers').on('click', 'a', this.toggleLayer);
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


        var lat = $(this).data("lat");
        var lon = $(this).data("lon");
        var zoom = $(this).data("zoom");
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
            console.log("set to contentHeight" + contentHeight);
            $('.contentbar-fill').height(contentHeight);
        } else {
            //console.log("set to maxHeight" + maxHeight + " .window: " + $(window).height() + "header: " + $('.contentbar-header').height() + "boxmenu: " + $('.boxmenu').height());
            $('.contentbar-fill').height(maxHeight);
        }
    }

};

moabi.init();

})();



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



