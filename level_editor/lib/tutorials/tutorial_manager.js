var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tut_definition) {
    $(element).append('<header>' + tut_definition.header + '</header').append($.tmpl('tut_part', tut_definition.steps)).progressform();
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();

var tut_parts = [
  { id: 1, header: 'Getting started', content: '<p>Welcome!...</p>' },
  { id: 2, header: 'Fundamentals', content: '<p>Do some stuff...</p>' },
  { id: 3, header: 'Things to remember', content: '<p>Finally...</p>' }
];

$.template('tut_part', '<section data-tut-part="${id}"><header>${header}</header>{{html content}}</section>');

// jQuery hook
