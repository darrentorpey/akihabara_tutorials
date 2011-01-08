var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tutorial) {
    $(element).html(tutorial.createDOM()).tutorial();
  },

  loadTutorialFromFileIntoDOM: function(file_url, element) {
    $.ajax({ url: timestampedURL(file_url) + timestamp(), dataType: 'text', success: function(tutorial_markdown) {
      var tutorial = new Tutorial(Tutorials.manager.readTutorialFromMarkdown(tutorial_markdown));
      Tutorials.manager.createTutorial(element, tutorial);
    }});
  },

  readTutorialFromMarkdown: function(text) {
    var converter = new Showdown.converter();

    var text_pars = text.split('___');
    var parts = text_pars.map(function(text_part) {
      return converter.makeHtml(text_part);
    });

    var tutorial_header = $('<div></div>').append(parts[0]).text();
    var tutorial_parts = parts.map(function(part, i) {
      var tmp = $('<div></div>').append(part);
      return {
        id: i + 1,
        header: tmp.find('h2').text(),
        content: '<p>' + tmp.find('p').text() + '</p>'
      }
    });
    tutorial_parts = tutorial_parts.slice(1, tutorial_parts.length);

    return new Tutorial({
      header: tutorial_header,
      steps:  tutorial_parts
    });
  },

  loadDefaultTutorial: function() {
    this.loadTutorial({
      target: '#tutorial_box',
      file:   '../resources/tutorial.txt'
    });
  },

  loadTutorial: function(options) {
    if (options.file && options.target) {
      $(options.target).tutorial('destroy');
      Tutorials.manager.loadTutorialFromFileIntoDOM(options.file, options.target);
    }
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();