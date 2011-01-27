var YellowDot = TopDownActor.extend({
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
  var aki_box = new YellowDot({
    aki_attributes: {
      id:   'box_' + makeBoxEnemy_i++,
      game: the_game,
      x:    x,
      y:    y
    }
  });
  gbox.addObject(aki_box.getAkiObject());
}