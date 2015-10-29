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
        sortingDescClassName: 'magrid-desc',
        overlayBoxClassName: 'magrid-overlay',
        currentPageClass: 'magrid-active-page',
        disabledPageClass: 'magrid-disabled-page',
        overlayText: '',
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
        '  <div class="<%= overlayBoxClassName %>"><%= overlayText %></div>',
        '</div>'
    ].join('')),
    templateHelpers: function() {
        return {
            tableContainerClassName: this.getOption('tableContainerClassName'),
            tableClassName: this.getOption('tableClassName'),
            paginatorContainerClassName: this.getOption('paginatorContainerClassName'),
            overlayContainerClassName: this.getOption('overlayContainerClassName'),
            overlayBoxClassName: this.getOption('overlayBoxClassName'),
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
        'header:cell:click': 'on_header_cell_clicked',
        'paginator:page:click': 'on_page_clicked'
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
                sortingDescClassName: this.getOption('sortingDescClassName')
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
                    paginatorClassName: this.getOption('paginatorClassName'),
                    currentPageClass: this.getOption('currentPageClass'),
                    disabledPageClass: this.getOption('disabledPageClass')
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
