var CellView = MaGrid.CellView = Backbone.Marionette.ItemView.extend({
    tagName: 'td',
    template: _.template('<div><%= model[attr] %></div>'),
    templateHelpers: function() {
        return {
            model: this.getOption('bindedModel').toJSON()
        }
    },
    modelEvents: {
        'change': 'render'
    },
    triggers: {
        'click div': 'cell:click',
    }
});

var RowView = MaGrid.RowView = Backbone.Marionette.CollectionView.extend({
    reorderOnSort: true,
    tagName: 'tr',
    childViewEventPrefix: 'row',
    getChildView: function(column) {
        return column.get('cell') || CellView;
    },
    childViewOptions: function() {
        return {
            bindedModel: this.model
        }
    }
});

var BodyView = MaGrid.BodyView = Backbone.Marionette.CollectionView.extend({
    reorderOnSort: true,
    template: false,
    childView: RowView,
    childViewEventPrefix: 'body',
    childViewOptions: function(model, index) {
        return {
            collection: this.getOption('columns')
        }
    }
});
