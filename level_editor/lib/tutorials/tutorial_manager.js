var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tutorial) {
    $(element).html(tutorial.createDOM()).tutorial();
  },

  loadTutorialIntoDOM: function(file_url, element) {
    $.ajax({ url: timestampedURL(file_url) + timestamp(), dataType: 'text', success: function(tutorial_markdown) {
      var tutorial = new Tutorial(Tutorials.manager.readTutorialFromMarkdown(tutorial_markdown));
      Tutorials.manager.createTutorial(element, tutorial);
    }});
  },

  readTutorialFromMarkdown: function(text) {
    var converter = new Showdown.converter();

    var text_pars = text.split('___');
    // console.log(text_pars);

    var parts = text_pars.map(function(text_part) {
      return converter.makeHtml(text_part);
    });

    var tutorial_header = parts[0];
    var tutorial_parts = parts.map(function(part, i) {
      var tmp = $('<div></div>').append(part);
      return {
        id: i + 1,
        header: tmp.find('h2').text(),
        content: '<p>' + tmp.find('p').text() + '</p>'
      }
    });

    return {
      header: $('<div></div>').append(tutorial_header).text(),
      steps:  tutorial_parts.slice(1, tutorial_parts.length)
    }
  },

  loadDefaultTutorial: function() {
    $('#tutorial_box').tutorial('destroy');
    Tutorials.manager.loadTutorialIntoDOM('../resources/tutorial.txt', '#tutorial_box');
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();