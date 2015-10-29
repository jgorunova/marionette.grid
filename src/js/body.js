var CellView = MaGrid.CellView = Backbone.Marionette.ItemView.extend({
    tagName: 'td',
    template: _.template('<div><%= display_value  %></div>'),
    templateHelpers: function() {
        var display_value;
        if(this.column.get('display_value')) {
            display_value = this.column.get('display_value');
            if(_.isFunction(display_value)) {
                display_value = display_value(this.model);
            }
        } else {
            display_value = this.model.get(this.column.get('attr'));
        }
        return {
            display_value: display_value
        }
    },
    initialize: function() {
        this.column = this.model;
        this.model = this.getOption('bindedModel');
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.column, 'destroy', this.destroy);
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
