---
layout: documentation
language: fr
title: Advanced
tags:
  - guide
categories:
  - fr
---
# Advanced Functionality

*This section covers the more advanced functionality of the **Browse Page**.  Before reading more, it might be useful to read up on the technical components of the OSM data model first.  Find more on the [OSM Wiki](http://wiki.openstreetmap.org/wiki/Main_Page), or an OSM tutorial page like [switch2osm](http://switch2osm.org/).*

***

The **[Moabi Browse Page](osm.moabi.org)** allows users to explore detailed information about data in the database.  Within this page, it is possible to find details on the following:

1. Detailed Feature Data, including:
  * A feature's history, including when it was uploaded, by whom, and information on subsequent edits, if any.

  * A detailed listing of its XML structure, including a list of nodes, ways, and relations of which it is a part.

  * A full attribute list.

2. Changeset History, including:
  * A full log of changesets, including all uploads and edits grouped by their commit message.

  * The bounding box of each changeset, outlining the geographic extent of the changes.

If you are familiar with how to navigate the OSM home page, much of this should be familiar.


## Detailed Feature Data

1. To view more detailed information about a feature, including information on its geometry, xml structure, attributes, and changeset notes, click on the <span class="idcon layers"></span> **layers** button and select a layer. Zoom in on a feature you are interested in until the **Map Data** checkbox button in the bottom right is no longer grayed out.
![](https://farm4.staticflickr.com/3850/14309593446_37868794ce_c.jpg)

2. After a few seconds, all map features within the browser window should be outlined with a thick blue stoke.  Click on the feature of interest to view detailed information on that feature.  Now that you have located your feature, it might make sense to change the map layer to the base layer.
![](https://farm3.staticflickr.com/2897/14331471752_8c91339c44_z.jpg)

3. Above, we have selected way with the id number **9919**, which happens to be a mining concession.  With this detailed view, we can tell a number of things about the feature:

* It was edited five days ago by user `jlc_upload`, who according to the commit messsage, added the area=yes attribute. This was the second edit to that feature; the original upload would have been the first edit.

* We can see the complete attribute list for the feature, not just those attributes available as popups in the [data page]({{site.baseurl}}/data/{{page.language}}).

* This specific way is comprised of five nodes (id 640737, 640756, 640757, 640738, 640737).  Clicking on one of these node ids will bring us to a similar view of detailed information on that id.

We can click **Way History** to view the same detailed data above for every changeset version of that feature.  In this case, because it is marked as `Version #2`, there is only one additional detailed data view besides the one we are currently looking at.

We can also download an XML file for the feature.



## Changeset History

To view data on who uploaded data and when, click on the **History** button.  On the left is a list of all **changesets**, including each **commit message**, the **user name** of the uploader, and the **commit date**.  Within the map, an orange **bounding box** outlines the extent of the changeset.

![](https://farm4.staticflickr.com/3893/14353102453_4d61e8c917_z.jpg)

Click on either the changeset list item or the chagneset bounding box to view more information on the individual features of that changeset.  This could be useful for a number of reasons:

1. You find a feature that looks out of place and are interested in when it was uploaded, by whom, and what other features it was uploaded with.

2. You find a feature that is incorrect, and suspect that the other features it was uploaded with might also be incorrect.  If this is the case, it is possible to **revert** (or delete) the entire changeset.

3. You recently uploaded data and want to check whether the upload was successful.



