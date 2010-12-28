var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tutorial) {
    $(element).html(tutorial.createDOM()).tutorial();
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();