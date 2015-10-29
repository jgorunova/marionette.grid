/*!
  marionette.grid 0.0.1
  git+https://github.com/jgorunova/marionette.grid.git

  Copyright (c) 2015 Julia Gorunova
  Licensed under the MIT license.
*/

(function (root, factory) {

  if (typeof define === "function" && define.amd) {
    // AMD (+ global for extensions)
    define(["underscore", "backbone", "backbone.marionette"], function (_, Backbone, Marionette) {
      return (root.MaGrid = factory(_, Backbone, Marionette));
    });
  } else if (typeof exports === "object") {
    // CommonJS
    var Backbone = require("backbone");
    Backbone.$ = Backbone.$ || require("jquery");
    var Marionette = require("backbone.marionette");
    module.exports = factory(require("underscore"), Backbone, Marionette);
  } else {
    // Browser
    root.MaGrid = factory(root._, root.Backbone, root.Marionette);
  }}(this, function (_, Backbone, Marionette) {

  "use strict";

var MaGrid = Marionette.MaGrid = {
};
/**
 * @class MaGrid.Grid
 * @extends Marionette.View
 * @inheritdoc
 * @classdesc
 *
 * Class description
 *
 * @param {Object}  options
 * @param {array}  options.columns     columns
 * @param {Backbone.Collection} [options.collection]
 *
 */
MaGrid.Grid = Marionette.View.extend({
    template: false,
    initialize: function() {
        this.test = true;
    }
});
  return MaGrid;
}));