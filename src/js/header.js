var HeaderView = MaGrid.HeaderView = Backbone.Marionette.CollectionView.extend({
    tagName: 'tr',
    reorderOnSort: true,
    childViewEventPrefix: 'header',
    childViewOptions: function() {
        return {
            sortingAscClassName: this.getOption('sortingAscClassName'),
            sortingDescClassName: this.getOption('sortingDescClassName')
        };
    },
    childView: Backbone.Marionette.ItemView.extend({
        tagName: 'th',
        template: _.template('<a><%= header %></a>'),
        events: {
            'click a': 'on_click'
        },
        modelEvents: {
            'change:direction': 'on_direction_changed'
        },
        initialize: function() {
            this.sortingAscClassName = this.getOption('sortingAscClassName');
            this.sortingDescClassName = this.getOption('sortingDescClassName');
        },
        on_click: function() {
            if(this.model.get('sortable')) {
                this.trigger('cell:click');
            }
        },
        on_direction_changed: function(model, new_direction) {
            if(new_direction == 'asc') {
                this.$el.addClass(this.sortingAscClassName);
            } else if(new_direction == 'desc') {
                this.$el.addClass(this.sortingDescClassName);
            } else {
                this.$el
                    .removeClass(this.sortingDescClassName)
                    .removeClass(this.sortingAscClassName);
            }
        }
    })
});
