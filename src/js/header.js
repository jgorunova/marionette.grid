var HeaderView = MaGrid.HeaderView = Marionette.CollectionView.extend({
    tagName: 'tr',
    reorderOnSort: true,
    childViewEventPrefix: 'header',
    childViewOptions: function() {
        return {
            sortingAscClassName: this.getOption('sortingAscClassName'),
            sortingDescClassName: this.getOption('sortingDescClassName'),
            sortableColumnClassName: this.getOption('sortableColumnClassName'),
        };
    },
    childView: Marionette.ItemView.extend({
        tagName: 'th',
        template: _.template('<div><%= header %></div>'),
        modelEvents: {
            'change:direction': 'on_direction_changed'
        },
        initialize: function() {
            this.sortingAscClassName = this.getOption('sortingAscClassName');
            this.sortingDescClassName = this.getOption('sortingDescClassName');
            this.sortableColumnClassName = this.getOption('sortableColumnClassName');
        },
        onRender: function() {
            if(this.model.get('sortable')) {
                this.$el.on('click', _.bind(function() {
                    this.trigger('cell:click');
                }, this));
                this.$el.addClass(this.sortableColumnClassName);
            }
        },
        onBeforeDestroy: function() {
            this.$el.off('click');
        },
        on_direction_changed: function(model, new_direction) {
            if(new_direction == 'asc') {
                this.$el.addClass(this.sortingAscClassName)
                        .removeClass(this.sortableColumnClassName);
            } else if(new_direction == 'desc') {
                this.$el.addClass(this.sortingDescClassName)
                        .removeClass(this.sortableColumnClassName);
            } else if(this.model.get('sortable')) {
                this.$el
                    .removeClass(this.sortingDescClassName)
                    .removeClass(this.sortingAscClassName)
                    .addClass(this.sortableColumnClassName);
            }
        }
    })
});
