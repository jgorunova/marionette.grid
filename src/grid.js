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
