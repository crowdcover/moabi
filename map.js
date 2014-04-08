---
---
{% include js/jquery-1.10.2.min.js %}
{% include js/jquery-ui-1.10.4.custom.min.js %}
{% include js/leaflet-image.js %}

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

//test grid here
var tilejson = {"tilejson":"2.0.0","grids":["http://grids.osm.moabi.org/grids/grid/{z}/{x}/{y}.json"],"template":"{{#__location__}}{{/__location__}}{{#__teaser__}}<div class='name'>\n\t<div class='title'>{{{name}}}</div></div>{{/__teaser__}}{{#__full__}}{{/__full__}}"};
//tilejson = {"bounds":[11.7993,-13.6033,31.0474,5.5941],"center":[21.9727,-5.2879,6],"description":"","download":"http://a.tiles.mapbox.com/v3/helsinki.drc_concessions.mbtiles","filesize":12569600,"format":"png","grids":["http://grids.osm.moabi.org/tiles.py/grid/{z}/{x}/{y}.json"],"id":"helsinki.drc_concessions","legend":"","maxzoom":10,"minzoom":0,"name":"DRC Mine Concessions","private":false,"scheme":"xyz","template":"{{#__location__}}{{/__location__}}{{#__teaser__}}<div class='name'>\n\t<div class='title'>{{{Parties}}}</div>\n\t<div class='subtitle'>License #{{{Code}}}</div>\n</div>\n<div class='details'>\n    <ul class='details'>\n\t<li>Resource: <span class='value'>{{{Resource}}}</span></li>\n\t<li>Status: <span class='value'>{{{Statut}}}</span></li>\n\t<li>Requested: <span class='value'>{{{Demandée}}}</span></li>\n\t<li>Awarded: <span class='value'>{{{Octroyé}}}</span></li>\n        <li>Expires: <span class='value'>{{{Expire}}}</span></li>\n    </ul>\n    <div class='clear'></div>\n</div>{{/__teaser__}}{{#__full__}}{{/__full__}}","tilejson":"2.0.0","tiles":["http://a.tiles.mapbox.com/v3/helsinki.drc_concessions/{z}/{x}/{y}.png","http://b.tiles.mapbox.com/v3/helsinki.drc_concessions/{z}/{x}/{y}.png"],"version":"1.0.0","webpage":"http://a.tiles.mapbox.com/v3/helsinki.drc_concessions/page.html"};
var gridLayer = L.mapbox.gridLayer(tilejson);
this.map.addLayer(gridLayer);
this.map.addControl(L.mapbox.gridControl(gridLayer));

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

            // remove all layers
            moabi.removeAllLayers();

            // toggle layers/navigate according to previous slide location
            var prevSlide = report.prev(),
                prevMapId = prevSlide.data('id'),
                prevNav = prevSlide.data('nav');
            if (prevMapId){
                for (i = 0; i < prevMapId.length; i++){
                    $('.layer-ui .layer-toggle[data-id="' + prevMapId[i] + '"]').trigger('click');
                }
            }
            if (prevNav){
                map.setView([prevNav[0], prevNav[1]], prevNav[2]);
            }
        } else {
            newIndex = reportIndex + 1;
            reportContainer.removeClass('active' + reportIndex).addClass('active' + newIndex);

            // remove all layers
            moabi.removeAllLayers();

            // toggle layers/navigate according to next slide location
            var nextSlide = report.next(),
                nextMapId = nextSlide.data('id'),
                nextNav = nextSlide.data('nav');
            if (nextMapId){
                for (i = 0; i < nextMapId.length; i++){
                    $('.layer-ui .layer-toggle[data-id="' + nextMapId[i] + '"]').trigger('click');
                }
            }
            if (nextNav){
                map.setView([nextNav[0], nextNav[1]], nextNav[2]);
            }
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
            //GRID HERE?
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
    },

    removeAllLayers: function() {
        $('.layer-ui .displayed .layer-toggle').trigger('click');

        // below doesn't work if layers were added via .layer-ui trigger click
        // for (var id in mapLayers['dataLayers']){
        //     map.removeLayer(mapLayers['dataLayers'][id][0]);
        // }
    }

};

window.moabi = moabi;

})(window);

moabi.global();
