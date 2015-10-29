/*!
  marionette.grid 0.0.1
  git+https://github.com/jgorunova/marionette.grid.git

  Copyright (c) 2015 Julia Gorunova
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

var CellView = MaGrid.CellView = Backbone.Marionette.ItemView.extend({
    tagName: 'td',
    template: _.template('<div><%= model[attr] %></div>'),
    templateHelpers: function() {
        return {
            model: this.getOption('bindedModel').toJSON()
        }
    },
    modelEvents: {
        'change': 'render'
    },
    triggers: {
        'click div': 'cell:click',
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

var HeaderView = MaGrid.HeaderView = Backbone.Marionette.CollectionView.extend({
    tagName: 'tr',
    reorderOnSort: true,
    childViewEventPrefix: 'header',
    childViewOptions: function() {
        return {
            sortingAscClassName: this.getOption('sortingAscClassName'),
            sortingDescClassName: this.getOption('sortingsDescClassName')
        };
    },
    childView: Backbone.Marionette.ItemView.extend({
        tagName: 'th',
        template: _.template('<a><%= header %></a>'),
        triggers: {
            'click a': 'cell:click'
        },
        modelEvents: {
            'change:direction': 'on_direction_changed'
        },
        initialize: function() {
            this.sortingAscClassName = this.getOption('sortingAscClassName');
            this.sortingDescClassName = this.getOption('sortingsDescClassName');
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
        className: 'magrid-container',
        tableContainerClassName: 'magrid-table-container',
        paginatorContainerClassName: 'magrid-paginator-container',
        overlayContainerClassName: 'magrid-overlay-container',
        tableClassName: 'magrid-table',
        paginatorClassName: 'magrid-paginator',
        sortingAscClassName: 'magrid-asc',
        sortingsDescClassName: 'magrid-desc',
        overlayText: 'wait...',
        cellEvents: {
            //'cell:click': 'on_cell_click',  //place to listen any Cell event
        },
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
        '    <thead></thead>',
        '    <tbody></tbody>',
        '    <tfoot></tfoot>',
        '  </table>',
        '</div>',
        '<div class="<%= paginatorContainerClassName %>"></div>',
        '<div class="<%= overlayContainerClassName %>" style="display: none;">',
        '  <%= overlayText %>',
        '</div>'
    ].join('')),
    templateHelpers: function() {
        return {
            tableContainerClassName: this.getOption('tableContainerClassName'),
            tableClassName: this.getOption('tableClassName'),
            paginatorContainerClassName: this.getOption('paginatorContainerClassName'),
            overlayContainerClassName: this.getOption('overlayContainerClassName'),
            overlayText: this.getOption('overlayText')
        }
    },
    regions: function() {
        return {
            headerRegion: 'thead',
            footerRegion: 'tfoot',
            paginatorRegion: '.' + this.getOption('paginatorContainerClassName')
        };
    },
    ui: function() {
        return {
            body: 'tbody',
            overlay: '.' + this.getOption('overlayContainerClassName')
        };
    },
    collectionEvents: {
        all: 'on_collection_event'
    },
    childEvents: {
        'header:cell:click': 'on_header_cell_clicked'
    },

    initialize: function() {
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

        var paginatorView = this.getPaginatorView();
        paginatorView && this.paginatorRegion.show(paginatorView);
    },
    getHeaderView: function() {
        if(!this._headerView) {
            this._headerView = new HeaderView({
                collection: this.columnsCollection,
                sortingAscClassName: this.getOption('sortingAscClassName'),
                sortingsDescClassName: this.getOption('sortingsDescClassName')
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
            });
            this.listenTo(this._bodyView, 'all', this.on_cell_event);
        }
        return this._bodyView;
    },
    getFooterView: function() {

    },
    getPaginatorView: function() {
        if(!this._paginatorView) {
            if (Backbone.PageableCollection && this.collection instanceof Backbone.PageableCollection) {
                this._paginatorView = new PaginatorView({
                    bindedCollection: this.collection,
                    paginatorClassName: this.getOption('paginatorClassName')
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
    on_collection_event: function(event_name) {
        if (event_name == 'request' && this.getOption('showLoader')) {
            this.showLoader();
        } else if (event_name == 'sync' || event_name == 'error') {
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
    on_cell_event: function(event_name, body_view, row_view, cell_view) {
        var clean_event_name = event_name.replace('body:row:', '');
        var method_name = (this.getOption('cellEvents') || {})[clean_event_name];
        if (_.isFunction(method_name)) {
            method_name(row_view, cell_view);
        } else if (_.isFunction(this[method_name])) {
            this[method_name](row_view, cell_view);
        }
    },
});
  return MaGrid;
}));