---
layout: layouts2/blog_post
language: en
tags:
  - blog_post
categories:
  - en
title: Hacking Logging Roads
subtitle: Moabi and WRI teamed up at the Brooklyn EcoHack last weekend to map logging roads in Equateur Province.  Check out the results.
author: James Conkling
img: https://farm8.staticflickr.com/7350/14198779724_8f4b1721ba_c.jpg
draft:
---

Last weekend was the 2014 [EcoHack](http://ecohack.org/), a hackathon bringing together scientists, programmers and designers to collaborate on environmental themed projects.  To take advantage of such talent, Moabi and the [World Resource Institute](http://www.wri.org/) teamed up to map logging roads in Equateur Province, in eastern DRC.  Bringing together data from WRI and OSM, the hackathon was the perfect place to demo Moabi tools, in particular our clone of the [iD editor](http://learnosm.org/en/editing/id-editor/).

![hacking](https://farm6.staticflickr.com/5573/14012182589_9cd3710a72_c.jpg)

## What We Found

By tracing satellite imagery from 2000 to 2013 overlaid with WRI's [roads dataset](http://www.wri.org/our-work/project/congo-basin-forests/democratic-republic-congo#project-tabs), our team found at least six different areas with logging roads, at least three of which were exhibiting continued development as of 2013.

*Note: we have not yet validated all of our findings, so inconsistencies and gaps may exist.*

<iframe width="100%" height="500px" frameBorder="0" src="http://a.tiles.mapbox.com/v3/helsinki.logging_roads_viz.html"></iframe>

<div class="moabi-legend space-bottom4 active" style="width:360px">
    <div class="col12">
        <h3 class="small center pad0">traced roads</h3>
    </div>
    <div class="pad0x">
        <span class="legend-icon" style="border-bottom: 2px solid #7E7E7E; position: relative; bottom: 6px; width: 27px;"></span>
        <h3 class="micro">Non-logging Road</h3>
    </div>
    <div class="pad0x">
        <span class="legend-icon" style="border-bottom: 2px dotted #7E7E7E; position: relative; bottom: 6px; width: 27px;"></span>
        <h3 class="micro">Logging Road</h3>
    </div>
    <table class="fixed">
        <thead>
            <tr>
                <th class="center" style="font:12px/2em 'Open Sans', sans-serif">no year</th>
                <th class="center" style="font:12px/2em 'Open Sans', sans-serif">2000</th>
                <th class="center" style="font:12px/2em 'Open Sans', sans-serif">2005</th>
                <th class="center" style="font:12px/2em 'Open Sans', sans-serif">2010</th>
                <th class="center" style="font:12px/2em 'Open Sans', sans-serif">2012</th>
                <th class="center" style="font:12px/2em 'Open Sans', sans-serif">2013</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="background-color: #0044E0;"></td>
                <td style="background-color: #B505B5;"></td>
                <td style="background-color: #CE003F;"></td>
                <td style="background-color: #E14402;"></td>
                <td style="background-color: #E06702;"></td>
                <td style="background-color: #E28F02;"></td>
            </tr>
        </tbody>
    </table>
</div>

The pattern of industrial logging roads is distinct in five of the six areas: perpendicular lines that systematically grid new forest plots.  Primary logging roads bisect large swaths of the forest, with secondary and tertiary roads further gridding the area into smaller rectangles accessible by logging skidders.  The tracks cut by the skidders are not visible by satellite imagery, though these would most likely further crisscross the untraced areas between the primary, secondary and tertiary logging roads.

Logging of forest concessions takes place on yearly rotations.  This systematic rotation is clearly visible at the northern-most concession, where logging first expanded in a ring to the north, north west, and east between 2000 and 2005 (red); then, by 2010, expanded further to the east and south (dark orange); next expanding to the north by 2012 (light orange), and finally filling in an area in the center by 2013 (yellow).

Zoom in and pan to navigate the map.  Hover over a traced road to find the date it was first observed on satellite imagery.



## How We Did It

Equateur Province is nearly the size of all of New England and New York State.  In order to systematically map such a wide area in such a small amount of time, we employed the [OSM Tasking Manager](http://tasks.hotosm.org/) to microtask tracing for the entire area.  For map editing, we used a customized deployment of the in-browser [iD editor](http://learnosm.org/en/editing/id-editor/), which saved all edits to our database.  Because the edits were not actively validated during the hackathon, no edits were pushed to the OSM site itself.

Our workflow looked something like this:

1) Grid the area of interest using the Tasking Manager and assign map editors to individual grid cells.

<img class="space-bottom2" src="http://farm6.staticflickr.com/5035/14231717164_8e69dc5135_c.jpg" alt="OSM Tasking Manager" style="height:300px;">

2) Within the Moabi iD instance, explore the existing road network within the grid cell (outlined in purple) and overlay satellite imagery from all available years: 2000, 2005, 2010, 2012, and 2013.

<img class="space-bottom2" src="http://farm8.staticflickr.com/7323/14169164633_9ee85067c3_c.jpg" alt="iD Satellite Image buttons" style="height:300px;">

3) Start tracing.  Add attribute tag `logging='yes'` to logging roads.  If it is possible to tell what year the road first appeared based on the satellite imagery date, add the attribute tag `first_observed='{date}'`.

<img class="space-bottom2" src="http://farm6.staticflickr.com/5585/14202389466_b35b789e75_c.jpg" alt="Tracing in iD" style="height:300px;">

4) When the assigned grid cell is fully mapped, the data is saved to our database and the cell is marked as done in the Tasking Manager.  Time permitting, the user can choose to map a new grid cell.

<img class="space-bottom2" src="https://farm6.staticflickr.com/5485/14222223531_652dbfee79_c.jpg" alt="OSM Tasking Manager" style="height:300px;">

5) Once all areas of interest are mapped, final editing, data cleaning, and validation are done via iD and [JOSM](https://josm.openstreetmap.de/) .  When we have completed all map validation, we will host the data on the Moabi platform, share it with our partners, and upload the data to OSM.

***

The hack was a great proof of concept, producing some really compelling data while allowing us to demo our online mapping tools with a large, diverse group of users.  Soon, we'll be expanding on what we did here for other areas in the region, improving the workflow and hopefully producing some really valuable data.

We couldn't have pulled this off without active collaboration with so many different partners and contributors, in particular WRI, the EcoHack team, and [Etsy](http://www.etsy.com/), for volunteering their workspace for the hackathon.  Also, a huge thank you to all those at the EcoHack who helped us map.
