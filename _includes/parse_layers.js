{% assign mapBaseLayer = page.basemap.layers | first %}
var mapLayers = {
    baseLayer: {
        id: '{{mapBaseLayer.id}}',
        latlon: [{{page.basemap.center.lat}}, {{page.basemap.center.lon}}],
        zoom: {{page.basemap.center.zoom}}
    },
    dataLayers: {},
    currentLanguage: '{{page.language}}',
    pageType: '{{page.layout}}'
};
