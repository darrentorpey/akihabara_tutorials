var AkiPlayer = Klass.extend({
  init: function(options) {
    if (!options) options = {};

    this.game = the_game;
    this.aki_attributes = options.aki_attributes || {};
  },

  getAkiObject: function() {
    var obj = this.aki_attributes;
    _.extend(obj, akiba.actors.top_down_object, {
      game: this.game,
      colh: gbox.getTiles('player_tiles').tileh,
      x: 50,
      y: 30
    });

    akiba.animation.makeAnimationList(obj, 'eight_way_std');
    akiba.controls.setControlKeys(obj, 'eight_way_std');
    akiba.physics.setPhysics(obj);

    return obj;
  }
});