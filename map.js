---
---
{% include js/jquery-1.10.2.min.js %}

(function(context) {
var moabi = {

    init: function() {

        if (window.page_data){
            var map = L.mapbox.map('map', undefined, {
                shareControl: true
            });

            map.setView(page_data.baseLayer.latlon, page_data.baseLayer.zoom);
            map.zoomControl.setPosition('topright');
            map.shareControl.setPosition('topright');
            map.legendControl.addLegend('<h3>Data Layers</h3>');

            //build base layer
            for(i = 0; i < page_data.baseLayer["id"].length; i++){
                L.tileLayer('http://tiles.osm.moabi.org/' + page_data.baseLayer["id"][i][0] + '/{z}/{x}/{y}.png').addTo(map);
            }
        }

        $(document).ready(this.contentBarResize);
        $(window).resize(this.contentBarResize);

        $('.boxmenu').on('click', 'a', this.showMajorPanel);
        $('.minor-panel-viewer').on('click', 'a', this.showMinorPanel);
        $('.navigate').on('click', 'a', this.navigate);
        $('.toggle-layer').on('click', 'a', this.toggleLayer);
        // $('.toggle-language').on('click', 'a', this.toggleLanguage);
        $('.moabi-legend').appendTo('.map-legend').on('click', this.legendToggleLayer);
        $('.slideshow').on('click', '.slide-control', this.imgSlide);
    },

    legendToggleLayer: function(e) {
        var mapId = $(this).data('id');

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

moabi.init();

window.moabi = moabi;

})(window);
