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
        overlayContainerClassName: 'magrid-overlay-container',
        tableClassName: 'magrid-table',
        paginatorClassName: 'magrid-paginator',
        sortingAscClassName: 'magrid-asc',
        sortingDescClassName: 'magrid-desc',
        sortableColumnClassName: 'magrid-sortable',
        overlayBoxClassName: 'magrid-overlay',
        currentPageClass: 'magrid-active-page',
        disabledPageClass: 'magrid-disabled-page',
        emptyTextClassName: 'magrid-empty-text',
        overlayText: '',
        emptyText: 'No data to display',
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
        '<div class="<%= paginatorContainerClassName %>" data-magrid_region="paginator"></div>',
        '<div class="<%= overlayContainerClassName %>" style="display: none;" data-magrid_region="overlay">',
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
    regions: {
        headerRegion: '[data-magrid_region="header"]',
        footerRegion: '[data-magrid_region="footer"]',
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
        'paginator:page:click': 'on_page_clicked'
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
                emptyTextClassName: this.getOption('emptyTextClassName')
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

        var need_trigger = (this.getOption('cellEvents') || []).indexOf(clean_event_name) > -1;
        if (need_trigger) {
            this.triggerMethod(clean_event_name, row_view, cell_view);
        }
    },
});
