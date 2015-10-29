
var PaginatorView = MaGrid.PaginatorView = Marionette.CollectionView.extend({
    tagName: 'ul',
    childViewEventPrefix:'paginator',
    childView: Marionette.ItemView.extend({
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
        var window_size = this.getOption('paginatorWindowSize');
        var state = collection.state;

        var first_page = Math.max(1, state.firstPage);
        var last_page = Math.max(1, state.firstPage, state.lastPage);
        var curren_page = Math.max(state.currentPage, state.firstPage);
        var prev_page = Math.max(1, curren_page -1);
        var next_page = Math.min(last_page, curren_page+1);

        var prefix_window = [{
            is_current: false,
            label: '<<',
            is_disabled: (curren_page == 1),
            page_num: 1
        }, {
            is_current: false,
            label: '<',
            is_disabled: (curren_page == 1),
            page_num: prev_page
        }];

        var pages_window = this.calculateWindow(first_page, curren_page, last_page, window_size);

        var suffix_window = [{
            is_current: false,
            label: '>',
            is_disabled: (curren_page == last_page),
            page_num: next_page
        }, {
            is_current: false,
            label: '>>',
            is_disabled: (curren_page == last_page),
            page_num: last_page
        }];

        var full_window = prefix_window.concat(pages_window).concat(suffix_window);

        this.collection.reset(full_window);

    },

    calculateWindow: function(first_page, curren_page, last_page, window_size) {
        var i, page_num;
        var pages_window=[{
            is_current: true,
            label: curren_page + '',
            is_disabled: false,
            page_num: curren_page
        }];

        for(var i=1; i<=window_size; i++) {
            if(pages_window.length >= window_size) {
                break;
            }
            // try to add  page after current
            page_num =  curren_page +  i;
            if(page_num <= last_page) {
                pages_window.push({
                    is_current: false,
                    label: page_num + '',
                    is_disabled: (curren_page == last_page),
                    page_num: page_num
                });
                if(pages_window.length >= window_size) {
                    break;
                }
            }
            // try to add page before current
            page_num =  curren_page -  i;
            if(page_num >= first_page) {
                pages_window.splice(0,0, {
                    is_current: false,
                    label: page_num + '',
                    is_disabled: (curren_page == first_page),
                    page_num: page_num
                });
                if(pages_window.length >= window_size) {
                    break;
                }
            }
        }
        return pages_window;
    }
});
