// properties are directly passed to `create` method
var GameManager = Class.create({
  initialize: function(game_cycle) {
    this.game_cycle = game_cycle;
  },

  disableIntroAnimation: function() {
    this.game_cycle.gameIntroAnimation = function() { return true; }
  },

  disableStartMenu: function() {
    this.game_cycle.gameMenu = function() { return true; }
  }
});