var CellView = MaGrid.CellView = Marionette.ItemView.extend({
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


var FloatCell = MaGrid.FloatCell = CellView.extend({
    template: _.template('<div><%= parseFloat(display_value).toFixed(2) %></div>'),
});


var PercentCell = MaGrid.PercentCell = CellView.extend({
    template: _.template('<div><%= parseFloat(display_value).toFixed(2) %> %</div>'),
});
