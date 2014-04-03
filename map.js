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

var moabi = {

    global: function() {
        // $(document).ready(this.contentBarResize);
        // $(window).resize(this.contentBarResize);

        $('.slider').on('click', 'a', this.slide);
        $('.report-slider').on('click', this.slidePage);
        // $('.boxmenu').on('click', 'a', this.showMajorPanel);
        $('.minor-panel-viewer').on('click', 'a.layer-toggle', this.showMinorPanel);
        $('.layer-ui').on('click', 'a.layer-toggle', this.layerUi);
        $('.navigate').on('click', 'a', this.navigate);
        // $('.toggle-language').on('click', 'a', this.toggleLanguage);
        $('.moabi-legend').appendTo('.map-legend').on('click', this.legendToggleLayer);
        $('.slideshow').on('click', '.slide-control', this.imgSlide);

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
                    console.log(numLayers - index + " : " + $(this).children('a').text() );

                });
                console.log("----");
            }
        });
        $( ".sortable" ).disableSelection();

        $('.not-displayed').css('height', function(){
            totalHeight = 2;
            $('.not-displayed').children('li').each(function(){
                totalHeight += $(this).outerHeight();
            });
            console.log("total height" + totalHeight);
            return totalHeight;
        });
    },

    mapCapture: function(e) {
        e.preventDefault();
        e.stopPropagation();

        leafletImage(map, function(err, canvas) {
            var $imgContainer = $('#images');
            console.log('image capture fired: this= ' + this);

            var mapCapture = document.createElement('img');
            var dimensions = map.getSize();
            // img.width = dimensions.x;
            // img.height = dimensions.y;
            mapCapture.src = canvas.toDataURL();
            $imgContainer.children('img').remove();
            $imgContainer.append(mapCapture);
        });
    },

    slide: function() {
        var $this = $(this),
            tabgroup = $this.parents('.tab-group'),
            index = $this.data('index'),
            oldIndex = $(this).siblings('.active').removeClass('active').data('index'),
            slidecontainer = tabgroup.next();

        // $('a', tabgroup).removeClass('active');

        $this.addClass('active');
        slidecontainer.removeClass('active' + oldIndex).addClass('active' + index);
        return false;
    },

    slidePage: function() {
        // e.preventDefault();
        // e.stopPropagation();

        var $this = $(this),
            report = $(this).parent(),

            reportIndex = report.data('index'),
            reportCount = report.data('ixcount'),
            reportContainer = report.parent('.report-container');

        if ( $this.data('slide') == 'up' ){
            newIndex = reportIndex - 1;
            reportContainer.removeClass('active' + reportIndex).addClass('active' + newIndex);
        } else {
            newIndex = reportIndex + 1;
            reportContainer.removeClass('active' + reportIndex).addClass('active' + newIndex);
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

        var layer = mapLayers.dataLayers[mapId][0],
            layerLegend = mapLayers.dataLayers[mapId][1],
            $mapLegend = $('.map-legend');

        // if button is active, remove layer from map and move button to notDisplayed
        if ($this.hasClass('active')) {
            $this.removeClass('active');
            map.removeLayer(layer);

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
        }
    },

    filterLayers: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            category = $this.data('category');

        $this.siblings('ul.nodisplay').children('li').each(function(){
            $this = $(this);
            if ($this.data('categories').split(',').indexOf(category) == -1) {
                $this.hide();
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

        console.log('show minor panel fired')

        if ($this.hasClass('active')) {
            // close the active panel and open the previous one
            $('.minor-panel[data-id="' + panelId + '"]').removeClass('active');

            var nextInLine = $this.closest('li').siblings('li').children('a.active:last').data('id');
            if (nextInLine) {
                $('.minor-panel[data-id="' + nextInLine + '"]').addClass('active');
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
