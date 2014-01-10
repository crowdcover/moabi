---
---
{% include js/jquery-1.10.2.min.js %}


var map = L.mapbox.map('map', 'helsinki.moabi_base', {
    //legendControl: true,
    shareControl: true
})
    .setView([-2.877, 22.830], 5);



// Main Menu panel switcher
$('.boxmenu li a').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var panelClassName = '.' + $(this).attr('id') + '.main-panel';

    $(this).parent('li').siblings('li').children('a.active').removeClass('active');
    $(this).addClass('active');

    // $('.main-panel').hide();
    // $(panelClassName).show();
    $('.main-panel.active').removeClass('active')
    $(panelClassName).addClass('active')
});


// REDD+ Project panel switcher
$('.redd-buttons li a').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var panelId = '#' + $(this).attr('id') + '-panel';

    //make button .active
    $(this).parent('li').siblings('li').children('a.active').removeClass('active');
    $(this).addClass('active');

    //close any open panel and open the new one
    $(this).closest('div').children('.minor-panel.active').removeClass('active');
    $(panelId).addClass('active');
});


// Data Layers panel
function addRadioButton(mapId, elementId) {
    var layer = L.mapbox.tileLayer(mapId);

    $('#' + elementId).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            $(this).removeClass('active');
        } else {
            map.addLayer(layer);
            $(this).addClass('active');

            $(this).closest('div').children('.minor-panel.active').removeClass('active');
            $('#' + elementId + '-panel').addClass('active');
        }
    });
}



// map zoom-to navigation buttons
function navigate(elementId, latlonzoom) {
    $('#' + elementId).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var location = latlonzoom.split(',');
        var latLon = [location[0],location[1]];
        var zoom = location[2];
        map.setView(latLon, zoom);

        // $(this).parent('li').siblings('li').children('a.active').removeClass('active');
        // $(this).addClass('active');
    });
}


// bind all handlers to their elements
addRadioButton('helsinki.moabi_transport', 'transport');
addRadioButton('helsinki.moabi_logging', 'logging');
addRadioButton('helsinki.moabi_mining', 'mining');
addRadioButton('helsinki.moabi_oil', 'oil');
addRadioButton('helsinki.moabi_mining', 'palm');
addRadioButton('helsinki.moabi_oil', 'indigenous');

navigate('era', '-2,18,8');
navigate('luki', '-5.6,13.2,8');
navigate('tayna', '-0.35,28.74,8');
navigate('kwamouth', '-3.9,16.6,8');
navigate('ecomakala', '-1,29.3,8');
navigate('mambasa', '1.1,29.1,8');
navigate('isangi', '0.9,24.1,8');
navigate('mitsoshi', '-5.1,29.1,8');
navigate('jadora', '0.4,23.95,8');
