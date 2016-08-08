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
