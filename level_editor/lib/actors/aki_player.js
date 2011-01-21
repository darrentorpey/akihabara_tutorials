var TopDownActor = Klass.extend({
  init: function(options) {
    if (!options) options = {};

    this.game = the_game;
    this.aki_attributes = options.aki_attributes || {};
  },

  getAkiObject: function() {
    var obj = _(this.aki_attributes).extend(akiba.actors.top_down_object);

    akiba.animation.makeAnimationList(obj, 'eight_way_std');
    akiba.physics.setPhysics(obj);

    return obj;
  }
});

var AkiPlayer = TopDownActor.extend({
  init: function(options) {
    options.aki_attributes = _.extend(options.aki_attributes || {}, {
      group:   'player',
      tileset: 'player_tiles'
    })

    this._super(options);
  },

  getAkiObject: function() {
    var obj = this._super();
    akiba.controls.setControlKeys(obj, 'eight_way_std');
    return obj;
  }
});

var AkiBox = TopDownActor.extend({
  init: function(options) {
    options.aki_attributes = _.extend(options.aki_attributes || {}, {
      group:   'enemies',
      tileset: 'enemy_tiles',
      hitByBullet: function() {
        toys.generate.sparks.simple(this, 'background', null, { animspeed: 2, tileset: 'explosion_tiles', accx: 0, accy: 0 });

        gbox.trashObject(this);
      }
    })

    this._super(options);
  }
});

var makeBoxEnemy_i = 3;
makeBoxEnemy = function(x, y) {
  var aki_box = new AkiBox({
    aki_attributes: {
      id:   'box_' + makeBoxEnemy_i++,
      game: the_game,
      x:    x,
      y:    y
    }
  });
  gbox.addObject(aki_box.getAkiObject());
}