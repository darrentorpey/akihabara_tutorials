var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tutorial, options) {
    $(element).html(tutorial.createDOM()).tutorial(options);
  },

  loadTutorialFromFileIntoDOM: function(file_url, element, options) {
    $.ajax({ url: timestampedURL(file_url), dataType: 'text', success: function(tutorial_markdown) {
      var tutorial = new Tutorial(Tutorials.manager.readTutorialFromMarkdown(tutorial_markdown));
      Tutorials.manager.createTutorial(element, tutorial, options);
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
      var header_text = tmp.find('h2').text();
      tmp.find('h2').remove();
      return {
        id: i + 1,
        header: header_text,
        content: '<p>' + tmp.html() + '</p>'
      }
    });
    tutorial_parts = tutorial_parts.slice(1, tutorial_parts.length);

    return new Tutorial({
      header: tutorial_header,
      steps:  tutorial_parts
    });
  },

  loadDefaultTutorial: function(options) {
    this.loadTutorial($.extend({
      target: '#tutorial_box',
      file:   'resources/tutorial.txt'
    }, options));
  },

  loadTutorial: function(options) {
    if (options.file && options.target) {
      $(options.target).tutorial('destroy');
      Tutorials.manager.loadTutorialFromFileIntoDOM(options.file, options.target, options);
    }
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();
Tutorials.brushes = new TutorialManager();