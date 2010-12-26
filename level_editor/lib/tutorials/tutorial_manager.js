var TutorialManager = Klass.extend({
  init: function() {
    this.tutorials = [];
  },

  createTutorial: function(element, tutorial) {
    $(element).append(tutorial.createDOM()).progressform();
  }
});
var Tutorials = {};
Tutorials.manager = new TutorialManager();

// jQuery hook
