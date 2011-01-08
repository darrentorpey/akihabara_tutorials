var Tutorial = Klass.extend({
  init: function(options) {
    this.header = options.header;
    this.steps = options.steps;
  },

  createDOM: function() {
    return $('<div></div>').append('<header>' + this.header + '</header').append($.tmpl('tut_part', this.steps)).html();
  }
});

$.template('tut_part', '<section data-tut-part="${id}"><header>${header}</header>{{html content}}</section>');