var AkiPlayer = Klass.extend({
  init: function(options) {
    if (!options) options = {};

    this.game = the_game;
    this.aki_attributes = options.aki_attributes || {};
  },

  getAkiObject: function() {
    var obj = this.aki_attributes;
    _.extend(obj, {
      game: this.game,
      colh: gbox.getTiles('player_tiles').tileh,
      x: 50,
      y: 30,

      initialize: function() {
        // aki_magic.init_topdown(this);
        akiba.magic.init_topdown(this);
      },

      first: function() {
        this.processControlKeys();

        this.updateAnimation();

        this.applyPhysics();
      },

      blit: akiba.magic.standard_blit
    });

    akiba.animation.makeAnimationList(obj, 'eight_way_std');
    akiba.controls.setControlKeys(obj, 'eight_way_std');
    akiba.physics.setPhysics(obj);

    return obj;
  }
});