describe("A Grid", function () {

  var Book = Backbone.Model.extend({});
  var Books = Backbone.Collection.extend({
    model: Book
  });

  var books;
  var grid;
  beforeEach(function () {
    books = new Books([{
      id: 1,
      title: "Alice's Adventures in Wonderland"
    }, {
      id: 2,
      title: "A Tale of Two Cities"
    }, {
      id: 3,
      title: "The Catcher in the Rye"
    }]);

    //grid = new MaGrid.Grid({
    //});
  });

  it("my first test", function () {
    expect(_.isUndefined(MaGrid) ).toBe(false);
  });

});
