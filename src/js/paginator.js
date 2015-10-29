
var PaginatorView = MaGrid.PaginatorView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    childViewEventPrefix:'paginator',
    childView: Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a href="#" title="Page <%= page_num %>"><%= label %></a>'),
        onRender: function() {
            this.$el.removeClass(this.getOption('currentPageClass'));
            this.$el.removeClass(this.getOption('disabledPageClass'));
            if(this.model.get('is_current')) {
                this.$el.addClass(this.getOption('currentPageClass'));
            } else if(this.model.get('is_disabled')) {
                this.$el.addClass(this.getOption('disabledPageClass'));
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
            this.trigger('page:click');
        }
    }),
    childViewOptions: function() {
        return {
            currentPageClass: this.getOption('currentPageClass'),
            disabledPageClass: this.getOption('disabledPageClass')
        }
    },
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

        var pages = [{
            id: 1,
            is_current: false,
            label: '<<',
            is_disabled: (currentPage == 1),
            page_num: 1
        }, {
            id: 2,
            is_current: false,
            label: '<',
            is_disabled: (currentPage == 1),
            page_num: prevPage
        }, {
            id: 3,
            is_current: true,
            label: '' + currentPage,
            is_disabled: false,
            page_num: currentPage
        }, {
            id: 4,
            is_current: false,
            label: '>',
            is_disabled: (currentPage == lastPage),
            page_num: nextPage
        }, {
            id: 5,
            is_current: false,
            label: '>>',
            is_disabled: (currentPage == lastPage),
            page_num: lastPage
        }];

        this.collection.reset(pages);

    }
});
