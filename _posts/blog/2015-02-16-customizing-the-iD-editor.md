---
categories: en
language: en
tags: blog_post
layout: layouts2/blog_post
published: true
title: Customizing the iD Editor
author: Sajjad Anwar
subtitle: Moabi and MapBox have been working hard to improve the OSM iD editor.
img: "https://farm9.staticflickr.com/8669/16492287116_73dcdf14cc_b_d.jpg"
---
*This blog post originally appeared on the MapBox Blog titled [Customization and support for arbitrary feature types in iD](https://www.mapbox.com/blog/customizing-id/).*

The OpenStreetMap [iD editor](http://ideditor.com/) provides powerful map editing in the browser with an emphasis on great user experience. It’s a great tool in its own right, so the [Moabi initiative](http://rdc.moabi.org/) decided to use it. Moabi is a collaborative map of environmental data built on OpenStreetMap *software* (that’s right, *not* the data).

To use iD on other data than OpenStreetMap, you’ll be looking for two main customization aspects: presets and imagery. Presets capture map features - in OpenStreetMap that would be streets, parks, buildings - in the case of Moabi these could be mining or logging concessions. In terms of imagery, OpenStreetMap uses Bing, Mapbox Satellite and a variety of other providers where Moabi uses a combination of sources like the University of Maryland forest cover.

To make iD easier to customize I spent two weeks working closely with [Aaron Lidman](https://www.mapbox.com/about/team/#aaron-lidman) and [John Firebaugh](https://www.mapbox.com/about/team/#john-firebaugh) with the support from the Moabi initiative. We implemented simple preset and imagery customization and as Moabi frequently deals with very large features, we’ve made it easier to edit them.

## Custom presets

iD now makes it really easy to load custom presets. You simply load presets together with the editor:

```var iD = iD()
  .presets(customPresets);
```

The format for presets is defined in the iD documentation. An example declaration for custom presets would look like this:

```{
    mining: {
        "name": "Mining Concession",
        "geometry": [
            "point",
            "line",
            "area"
        ],
        "tags": {
            "concession":"mining"
        },
    }
}
```

To supply inline help and autocomplete functionality for presets you can also specify your own tag info service like OpenStreetMap TagInfo like:

```var iD = iD()
  .presets(customPresets)
  .taginfo(iD.taginfo());
```

## Custom imagery

Just like custom presets, to overwrite the default imagery selection in iD with your own, use the .imagery() accessor like here:

```var iD = iD()
  .imagery(customImagery);
```

The expected format for imagery options is specified in the editor-imagery index documentation. An example would look like this:

```{
    "name": "Bing aerial imagery",
    "type": "bing",
    "description": "Satellite and aerial imagery.",
    "template": "http://www.bing.com/maps/",
    "scaleExtent": [
        0,
        22
    ],
    "id": "Bing",
    "default": true
}
```

## Editing large features

Editing data that contains very large and very small features in the same areas is challenging. To address this issue we have enabled a locking mechanism that limits access to very large features at high zoom levels.



For optimum performance, the minimum zoom level for editing is set at 16 by default. Depending on your data and use case, the minimum editable zoom level can now be configured like:

```var iD = iD().
  .minEditableZoom(12);
```
