/*!
  marionette.grid 0.0.1
  git+https://github.com/jgorunova/marionette.grid.git

  Copyright (c) 2016 Julia Gorunova
  Licensed under the MIT license.
*/

(function (root, factory) {

  if (typeof define === "function" && define.amd) {
    // AMD (+ global for extensions)
    define(["underscore", "backbone", "backbone.marionette"], function (_, Backbone, Marionette) {
      return (root.MaGrid = factory(_, Backbone, Marionette));
    });
  } else if (typeof exports === "object") {
    // CommonJS
    var Backbone = require("backbone");
    Backbone.$ = Backbone.$ || require("jquery");
    var Marionette = require("backbone.marionette");
    module.exports = factory(require("underscore"), Backbone, Marionette);
  } else {
    // Browser
    root.MaGrid = factory(root._, root.Backbone, root.Marionette);
  }}(this, function (_, Backbone, Marionette) {

  "use strict";

var MaGrid = {};


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
        this.listenTo(this.bindedCollection, 'sync', this.recalculatePages);
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


var SizerView = MaGrid.SizerView = Marionette.ItemView.extend({
    tagName: 'div',
    template: _.template([
        '<select><% for(var i in pageSizes) { %>',
        '<option <% if(pageSizes[i] == currentSize) { %> selected<% }%>  value="<%= pageSizes[i] %>">',
        '    <%= pageSizes[i] %> items per page',
        '</option>',
        '<% }%></select>'
    ].join('')),
    templateHelpers: function() {
        return {
            pageSizes: this.getOption('pageSizes'),
            currentSize: this.getOption('bindedCollection').state.pageSize
        }
    },
    events: {
        'change select': 'on_size_changed'
    },
    on_size_changed: function(e) {
        e.preventDefault();
        this.triggerMethod('sizer:change', parseInt(this.$('select').val()));
    },
    onRender: function() {
        this.$el.addClass(this.getOption('sizerClassName'));
    },

});

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
    renderChildView: function(view, index) {
      this.attachHtml(this, view, index);
      if (this.getOption('asyncRender')) {
          if(index < 50) {
              view.render();
          } else {
              setTimeout(_.bind(function() {
                  if(!view.isDestroyed) {
                     view.render();
                  }
              }, this), 1);
          }
      } else {
          view.render();
      }

      return view;
    },
    destroy: function() {
     if (this.isDestroyed) { return this; }

     this.triggerMethod('before:destroy:collection');
     this.destroyChildren({checkEmpty: false, async: this.getOption('asyncRender')});
     this.triggerMethod('destroy:collection');

     return Marionette.View.prototype.destroy.apply(this, arguments);
   },
    destroyChildren: function(options) {
        var destroyOptions = options || {};
        var shouldCheckEmpty = true;
        var childViews = this.children.map(_.identity);

        if (!_.isUndefined(destroyOptions.checkEmpty)) {
            shouldCheckEmpty = destroyOptions.checkEmpty;
        }

        if (destroyOptions.async) {
            this.children.each(function(view) {
                setTimeout(_.bind(function() {
                    this.removeChildView(view);
                }, this), 1);
            }, this);
        } else {
            this.children.each(this.removeChildView, this);
        }

        if (shouldCheckEmpty) {
        this.checkEmpty();
        }
        return childViews;
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

/**
 * @class MaGrid.GridView
 * @extends Marionette.LayoutView
 * @inheritdoc
 * @classdesc
 *
 * Class description
 *
 * @param {Object}  options
 * @param {array}  options.columns     columns
 * @param {Backbone.Collection} [options.collection]
 *
 */
var GridView = MaGrid.GridView = Marionette.LayoutView.extend({
    collection: null,
    columns: null,
    options: {
        showLoader: true,
        paginatorWindowSize: 4,
        className: 'magrid-container',
        tableContainerClassName: 'magrid-table-container',
        paginatorContainerClassName: 'magrid-paginator-container',
        sizerContainerClassName: 'magrid-sizer-container',
        overlayContainerClassName: 'magrid-overlay-container',
        tableClassName: 'magrid-table',
        paginatorClassName: 'magrid-paginator',
        sizerClassName: 'magrid-sizer',
        sortingAscClassName: 'magrid-asc',
        sortingDescClassName: 'magrid-desc',
        sortableColumnClassName: 'magrid-sortable',
        overlayBoxClassName: 'magrid-overlay',
        currentPageClass: 'magrid-active-page',
        disabledPageClass: 'magrid-disabled-page',
        emptyTextClassName: 'magrid-empty-text',
        overlayText: '',
        emptyText: 'No data to display',
        pageSizes: [25, 50, 100, 500],
        asyncRender: false,
        cellEvents: [
            //'custom_event' //place to listen any Cell event
        ],
        defaultComparator: function(column, direction, model1, model2) {
            var a, b;
            if (direction == 'desc') {
                a = model1.get(column);
                b = model2.get(column);
            } else {
                a = model2.get(column);
                b = model1.get(column);
            }
            if (a > b) return -1;
            else if (a < b) return 1;
            else return 0;
        },
    },

    template: _.template([
        '<div class="<%= tableContainerClassName %>">',
        '  <table class="<%= tableClassName %>">',
        '    <thead data-magrid_region="header"></thead>',
        '    <tbody data-magrid_region="body"></tbody>',
        '    <tfoot data-magrid_region="footer"></tfoot>',
        '  </table>',
        '</div>',
        '<div class="<%= sizerContainerClassName %>" data-magrid_region="sizer"></div>',
        '<div class="<%= paginatorContainerClassName %>" data-magrid_region="paginator"></div>',
        '<div class="<%= overlayContainerClassName %>" style="display: none;" data-magrid_region="overlay">',
        '  <div class="<%= overlayBoxClassName %>"><%= overlayText %></div>',
        '</div>'
    ].join('')),
    templateHelpers: function() {
        return {
            tableContainerClassName: this.getOption('tableContainerClassName'),
            tableClassName: this.getOption('tableClassName'),
            sizerContainerClassName: this.getOption('sizerContainerClassName'),
            paginatorContainerClassName: this.getOption('paginatorContainerClassName'),
            overlayContainerClassName: this.getOption('overlayContainerClassName'),
            overlayBoxClassName: this.getOption('overlayBoxClassName'),
            overlayText: this.getOption('overlayText')
        }
    },
    regions: {
        headerRegion: '[data-magrid_region="header"]',
        footerRegion: '[data-magrid_region="footer"]',
        sizerRegion: '[data-magrid_region="sizer"]',
        paginatorRegion: '[data-magrid_region="paginator"]'
    },
    ui: {
        body: '[data-magrid_region="body"]',
        overlay: '[data-magrid_region="overlay"]'
    },
    collectionEvents: {
        all: 'on_collection_event'
    },
    childEvents: {
        'header:cell:click': 'on_header_cell_clicked',
        'paginator:page:click': 'on_page_clicked',
        'sizer:change': 'on_page_size_changed'
    },

    initialize: function(options) {
        this.options = _.extend({}, GridView.prototype.options, options);
        // TODO: check options
        this.columnsCollection = new Backbone.Collection(this.getOption('columns'), {
            model: Backbone.Model.extend({
                defaults: {
                    header: '',
                    attr: '',
                    sortable: true,
                    cell: null,
                    comparator: null
                }
            })
        });
    },
    showLoader: function() {
        this.ui.overlay.show();
    },
    hideLoader: function() {
        this.ui.overlay.hide();
    },
    onRender: function() {
        var headerView = this.getHeaderView();
        headerView && this.headerRegion.show(headerView);

        var bodyView = this.getBodyView();
        bodyView.render();

        var footerView = this.getFooterView();
        footerView && this.footerRegion.show(footerView);

        var sizerView = this.getSizerView();
        sizerView && this.sizerRegion.show(sizerView);

        var paginatorView = this.getPaginatorView();
        paginatorView && this.paginatorRegion.show(paginatorView);
        this.$el.addClass(this.getOption('className'));
    },
    getHeaderView: function() {
        if(!this._headerView) {
            this._headerView = new HeaderView({
                collection: this.columnsCollection,
                sortingAscClassName: this.getOption('sortingAscClassName'),
                sortingDescClassName: this.getOption('sortingDescClassName'),
                sortableColumnClassName: this.getOption('sortableColumnClassName'),
            });
        }
        return this._headerView ;
    },
    getBodyView: function() {
        if(!this._bodyView) {
            this._bodyView = new BodyView({
                el: this.ui.body,
                collection: this.collection,
                columns: this.columnsCollection,
                emptyText: this.getOption('emptyText'),
                emptyTextClassName: this.getOption('emptyTextClassName'),
                asyncRender: this.getOption('asyncRender')
            });
            this.listenTo(this._bodyView, 'all', this.on_cell_event);
        }
        return this._bodyView;
    },
    getFooterView: function() {

    },
    getSizerView: function() {
        if(!this._sizerView) {
            if (Backbone.PageableCollection && this.collection instanceof Backbone.PageableCollection) {
                this._sizerView = new SizerView({
                    bindedCollection: this.collection,
                    sizerClassName: this.getOption('sizerClassName'),
                    pageSizes: this.getOption('pageSizes')
                });
            }
        }
        return this._sizerView;
    },
    getPaginatorView: function() {
        if(!this._paginatorView) {
            if (Backbone.PageableCollection && this.collection instanceof Backbone.PageableCollection) {
                this._paginatorView = new PaginatorView({
                    bindedCollection: this.collection,
                    paginatorClassName: this.getOption('paginatorClassName'),
                    currentPageClass: this.getOption('currentPageClass'),
                    disabledPageClass: this.getOption('disabledPageClass'),
                    paginatorWindowSize: this.getOption('paginatorWindowSize')
                });
            }
        }
        return this._paginatorView;
    },

    onBeforeDestroy: function() {
        if (this._bodyView) {
            this.stopListening(this._bodyView);
            this._bodyView.destroy();
        }
    },
    on_collection_event: function(event_name, target) {
        if(target  instanceof Backbone.Model) {
            // do not trigger on bubbled model event
            return;
        }
        if (event_name == 'request') {
            this.getOption('showLoader') && this.showLoader();
        } else if (event_name == 'sync' || event_name == 'error') {
            this._bodyView && this._bodyView.render();
            this.hideLoader();
        }
    },
    on_header_cell_clicked: function(header_view, header_cell_view) {
        var column = header_cell_view.model;
        var attribute = column.get('attr');
        var direction = (column.get('direction') == 'asc') ? 'desc' : 'asc';
        var order = (direction == 'asc') ? -1 : 1;

        this.columnsCollection.forEach(function(model, index) {
            model.set('direction', null);
        });
        column.set('direction', direction);

        var comparator = column.get('comparator');
        if (!_.isFunction(comparator)) {
            comparator = this.getOption('defaultComparator');
            comparator = _.partial(comparator, attribute, direction);
        } else {
            comparator = _.partial(comparator, direction);
        }

        if (this.collection instanceof Backbone.PageableCollection) {
            this.collection.setSorting(attribute, order);
            if (this.collection.fullCollection) {
                this.collection.fullCollection.comparator = comparator;
                this.collection.fullCollection.sort();
            } else {
                this.collection.state.currentPage = 1;
                this.collection.fetch({
                    reset: true,
                    success: function() {}
                });
            }
        } else {
            this.collection.comparator = comparator;
            this.collection.sort();
        }
    },
    on_page_clicked: function(paginator_view, page_view) {
        if(!page_view.model.get('is_active') && !page_view.model.get('is_disabled')) {
            var page = page_view.model.get('page_num');
            this.collection.getPage(page);
        }
    },
    on_page_size_changed:  function(sizer_view, page_size) {
        this.collection.setPageSize(page_size);
    },
    on_cell_event: function(event_name, body_view, row_view, cell_view) {
        var clean_event_name = event_name.replace('body:row:', '');

        var need_trigger = (this.getOption('cellEvents') || []).indexOf(clean_event_name) > -1;
        if (need_trigger) {
            this.triggerMethod(clean_event_name, row_view, cell_view);
        }
    },
});
  return MaGrid;
}));