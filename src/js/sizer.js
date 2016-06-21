
var SizerView = MaGrid.SizerView = Marionette.CollectionView.extend({
    tagName: 'ul',
    childViewEventPrefix:'sizer',
    childView: Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a href="#" title="<%= page_size %> items per page"><%= page_size %></a>'),
        onRender: function() {
            this.$el.removeClass(this.getOption('currentPageClass'));
            if(this.model.get('is_current')) {
                this.$el.addClass(this.getOption('currentPageClass'));
            }
        },
        modelEvents: {
            'change': 'render'
        },
        events: {
            'click a': 'on_click'
        },
        on_click: function(e) {
            e.preventDefault();
            this.trigger('size:click');
        }
    }),
    childViewOptions: function() {
        return {
            currentPageClass: this.getOption('currentPageClass')
        }
    },
    initialize: function() {
        this.collection = new Backbone.Collection([], {
            model: Backbone.Model.extend({
                defaults: {
                    page_size: null,
                    is_current: false
                }
            })
        });
        var page_sizes = this.getOption('pageSizes');
        var current_page_size = this.getOption('bindedCollection').state.pageSize;
        for(var i in page_sizes) {
            this.collection.add({
                is_current: (page_sizes[i] ==  current_page_size),
                page_size: page_sizes[i]
            });
        }
    },
    onRender: function() {
        this.$el.addClass(this.getOption('sizerClassName'));
    },

});
