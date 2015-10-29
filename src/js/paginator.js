
var PaginatorView = MaGrid.PaginatorView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    childView: Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a class="<%= is_current %> <%= is_disabled %>"><%= label %></a>'),
        modelEvents: {
            'change': 'render'
        }
    }),
    initialize: function() {
        this.collection = new Backbone.Collection([], {
            model: Backbone.Model.extend({
                defaults: {
                    id: null,
                    is_current: false,
                    is_disabled: false,
                    label: ''
                }
            })
        });

        this.bindedCollection = this.getOption('bindedCollection');
        this.listenTo(this.bindedCollection, 'add', this.recalculatePages);
        this.listenTo(this.bindedCollection, 'remove', this.recalculatePages);
        this.listenTo(this.bindedCollection, 'reset', this.recalculatePages);

        this.recalculatePages();
    },
    onRender: function() {
        this.$el.addClass(this.getOption('paginatorClassName'));
    },
    onBeforeDestroy: function() {
        this.bindedCollection && this.stopListening(this.bindedCollection);
    },
    recalculatePages: function() {
        var collection = this.bindedCollection;
        var state = collection.state;

        var firstPage = state.firstPage;
        var lastPage = state.lastPage;
        lastPage = Math.max(1, firstPage ? lastPage : lastPage);
        var currentPage = Math.max(state.currentPage, state.firstPage);
        currentPage = firstPage ? currentPage : currentPage;

        var prevPage = Math.max(1, currentPage -1);
        var nextPage = Math.min(lastPage, currentPage+1);
        var page_indexes = _.uniq([firstPage, lastPage, currentPage, prevPage, nextPage]);

        var pages = [];
        for(var i  in page_indexes) {
            pages.push({
                id: i + 1,
                is_current: (page_indexes[i] == currentPage),
                label: page_indexes[i]
            })
        }
        this.collection.reset(pages);

    }
});
