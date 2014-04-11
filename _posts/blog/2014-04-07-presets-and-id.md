---
layout: blog_post
categories: 
  - blog_post
title: Presets and iD
subtitle: "Presets are predefined set of tag(s) that represent a feature on the ground, for example, a Park. The idea of presets is widely used in OpenStreetMap and the iD editor makes it much easier. Presets can define fields, icons, and more metadata to make the feature unambiguous."
author: Sajjad Anwar
language: en
published: true
---

Presets are predefined set of tag(s) that represent a feature on the ground, for example, a Park. The idea of presets is widely used in OpenStreetMap and the iD editor makes it much easier. Presets can define fields, icons, and more metadata to make the feature unambiguous.

Though, it is still pretty difficult to create a new preset or edit an existing preset without having to rebuild iD. [The HOT Visual Tag Chooser](http://visualtags.hotosm.org/) is a great preset editor which is compatible with JOSM. It allows you to export and import presets as an XML. iD makes it easy to deal with presets by defining them as JSON and parsing them appropriately. This makes us think that the preset editor is a sensible feature for iD.

Broadly, we should be able to create new presets and edit existing ones. This means that there should be a way to keep track of the presets. We thought it made sense to extend the OpenStreetMap rails API to include end-points to create, edit and delete presets. This can be used to fetch the presets and then loaded into iD. As a first step, we [modified iD](https://github.com/crowdcover/iD/commit/b6c058c361d2b24e4851c3a3a89c7eb8c346e3a2#diff-c4bea94eae91e15ace0139d7ff52d5b2R44) to enable sideloading of presets via an external JSON or an HTTP request.

![preset editor](https://farm4.staticflickr.com/3795/13779212885_2be158bced.jpg)

Next, we [extended the OpenStreetMap rails API](https://github.com/crowdcover/openstreetmap-website/commit/a235bda8302422122641b236e4a81d63e0ca3802) to include CRUD for presets.

Finally, we [created a new 'mode' within iD](https://github.com/crowdcover/iD/commit/b1070bd4893d489167e74c9fc1b228777ae1fd36) for the preset editor and [forked a lot of existing UI elements](https://github.com/crowdcover/iD/commit/53ea583ec1aad74d5121d4a18ba77c901a988b30) to create the preset editor form.

![Search and edit presets.](https://farm6.staticflickr.com/5465/13779214503_f817a133ce.jpg)

The modifications in iD are a bit crude because this is a proof of concept. We realize that there's a lot of room for improvement. Since we are still getting a handle on how everything works in iD, there are several questions that came up during this process, such as:

<!-- FIXME : why is markdown not handling ordered list. HTML to get it working. -->
<ol style="list-style:inherit !important">
<li> We created a new mode for the preset editor to separate the interactions in the browse and edit mode. Is this a good approach?</li>
<li> We have forked the UI rendering into separate files like ui/preset_editor.js and ui/edit_preset_list.js. This essentially contains code similar to the rendering of the preset list and raw tag editor. Is this the right approach?</li>
<li> Right now, presets are tied to the geometry of the entity in the context. This doesn't make sense when editing a preset because the user would want to search for all presets and pick whichever. We made changes in ui/edit_preset_list.js to incorporate this. Is this good? Can we rethink the idea of geometry to include something like 'all'?</li>
<li> Does the overall structure of code look sensible?</li>
</ol>

We are hoping that this blog post will encourage conversations around the work that we have been doing and we can hopefully make the preset editor more concrete.
