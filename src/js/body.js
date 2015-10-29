var RowView = MaGrid.RowView = Marionette.CollectionView.extend({
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

var BodyView = MaGrid.BodyView = Marionette.CollectionView.extend({
    reorderOnSort: true,
    template: false,
    childView: RowView,
    childViewEventPrefix: 'body',
    childViewOptions: function(model, index) {
        return {
            collection: this.getOption('columns')
        }
    },
    emptyView: Marionette.ItemView.extend({
        tagName: 'tr',
        template: _.template('<td class="<%= emptyTextClassName %>" colspan="<%= colspan %>"><%= emptyText %></td>'),
        templateHelpers: function() {
            return {
                emptyText: this.getOption('emptyText'),
                emptyTextClassName: this.getOption('emptyTextClassName'),
                colspan: this.getOption('columns').length
            };
        },
        initialize: function() {
            this.listenTo(this.getOption('columns'), 'add', this.render);
            this.listenTo(this.getOption('columns'), 'remove', this.render);
            this.listenTo(this.getOption('columns'), 'reset', this.render);
        }
    }),
    emptyViewOptions: function() {
        return {
            columns: this.getOption('columns'),
            emptyText: this.getOption('emptyText'),
            emptyTextClassName: this.getOption('emptyTextClassName')
        }
    }
});
