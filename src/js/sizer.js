
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
