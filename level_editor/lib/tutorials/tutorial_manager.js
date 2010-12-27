var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tutorial) {
    $(element).html(tutorial.createDOM()).progressform();
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();