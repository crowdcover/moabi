{% comment %}
if page js needs to access any frontmatter configuration, include parse_config.js
in a html script tag before the main js file is executed
currently used to allow specification of baselayer and map center for each page
{% endcomment %}{% assign mapBaseLayer = layout.basemap.layers | first %}
var pageConfig = {
  baseLayer: {
    id: '{{mapBaseLayer.id}}',
    latlon: [{{layout.basemap.center.lat}}{{page.basemap.center.lat}}, {{page.basemap.center.lat}}{{layout.basemap.center.lon}}],
    zoom: {{page.basemap.center.zoom}}{{layout.basemap.center.zoom}}
  }
};
