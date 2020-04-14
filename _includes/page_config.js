{% comment %}
if page js needs to access any frontmatter configuration, include parse_config.js
in a html script tag before the main js file is executed
currently used to allow specification of baselayer and map center for each page
{% endcomment %}{% assign mapBaseLayer = page.basemap.layers | first %}
var pageConfig = {
  baseLayer: {
    id: '{{mapBaseLayer.id}}',
    latlon: [{{page.basemap.center.lat}} || -2.877, {{page.basemap.center.lon}} || 22.830],
    zoom: {{page.basemap.center.zoom}} || 6
  }
};
