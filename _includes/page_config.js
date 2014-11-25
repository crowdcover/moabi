{% comment %}
if page js needs to access any frontmatter configuration, include parse_config.js
in a html script tag before the main js file is executed
currently used to allow specification of baselayer and map center for each page
{% endcomment %}{% assign mapBaseLayer = page.basemap.layers | first %}
var pageConfig = {
  baseLayer: {
    id: '{{mapBaseLayer.id}}',
    latlon: [{{page.basemap.center.lat}}, {{page.basemap.center.lon}}],
    zoom: {{page.basemap.center.zoom}}
  }
};
