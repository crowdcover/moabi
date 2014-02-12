---
---
{% include js/jquery-1.10.2.min.js %}


var map = L.mapbox.map('map', undefined, {
    zoomControl: false
});

map.setView(page_data.baseLayer.latlon, page_data.baseLayer.zoom);
// map.zoomControl.setPosition('topright');
// map.shareControl.setPosition('topright');

//build base layer
for(i = 0; i < page_data.baseLayer["id"].length; i++){
    L.tileLayer('http://tiles.osm.moabi.org/' + page_data.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(map);
}


(function(context) {
var moabi = {

    init: function() {
        $(document).ready(this.contentBarResize);
        $(window).resize(this.contentBarResize);
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

};

moabi.init();

window.moabi = moabi;

})(window);
