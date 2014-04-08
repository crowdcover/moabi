---
published: false
---

## Presets and iD

Presets and predefined set of tag(s) that represent a feature on the ground, for example, a Park. The idea of presets is widely used in OpenStreetMap and the iD editor makes it much easier. Presets can define fields, icons and more metadata to make the feature unambiguous.  

Though, it is still pretty difficult to create a new preset or edit an existing preset without having to rebuild iD. [The HOT Visual Tag Chooser](http://visualtags.hotosm.org/) is a great preset editor which is compatible with JOSM. It allows you to export and import presets as an XML. iD makes it easy to deal with presets by defining them as JSON and parsing them appropriately. This makes us think that the preset editor is a sensible feature for iD. 

Broadly, we should be able to create new presets and edit existing ones. This means that there should be a way to keep track of the presets. We thought it made sense to extend the OpenStreetMap rails API to include end-points to create, edit and delete presets. This can be used to fetch the presets and then loaded into iD. As a first step, we [modified iD](https://github.com/crowdcover/iD/commit/b6c058c361d2b24e4851c3a3a89c7eb8c346e3a2#diff-c4bea94eae91e15ace0139d7ff52d5b2R44) to enable sideloading of presets via an external JSON or an HTTP request.

Next, we [extended the OpenStreetMap rails API](https://github.com/crowdcover/openstreetmap-website/commit/a235bda8302422122641b236e4a81d63e0ca3802) to include CRUD for presets.

Finally, we [created a new 'mode' within iD](https://github.com/crowdcover/iD/commit/b1070bd4893d489167e74c9fc1b228777ae1fd36) for the preset editor and [forked a lot of existing UI elements](https://github.com/crowdcover/iD/commit/53ea583ec1aad74d5121d4a18ba77c901a988b30) to create the preset editor form. 

