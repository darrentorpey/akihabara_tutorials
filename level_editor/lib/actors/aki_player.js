var AkiPlayer = TopDownActor.extend({
  init: function(options) {
    options.aki_attributes = _.extend(options.aki_attributes || {}, {
      group:   'player',
      tileset: 'player_tiles'
    })

    this._super(options);
    this.fireSpeed = 4;
  },

  getAkiObject: function() {
    var obj = this._super();
    akiba.controls.setControlKeys(obj, 'eight_way_std');
    this.currentFireBullet = _(this.fireBulletAtMouse).throttle(1000 / this.fireSpeed);

    obj.whenMouseDown = function() {
      the_game.player_one.currentFireBullet && the_game.player_one.currentFireBullet();
    }

    return obj;
  },

  fireBulletAtMouse: function() {
    var thePlayer = gbox.getObject('player', 'player_id');
    var cam = gbox.getCamera();
    var xPos = g_mouseIsAt.x - the_game.game_canvas.offsetLeft + cam.x;
    var yPos = g_mouseIsAt.y - the_game.game_canvas.offsetTop + cam.y;
    var ang = Math.atan2(yPos - (thePlayer.y + 8), xPos - (thePlayer.x + 8));
    the_game.player_one.fireBullet(ang);
  },

  changeFireSpeed: function(new_speed) {
    this.fireSpeed = new_speed;
    this.currentFireBullet = _(this.fireBulletAtMouse).throttle(1000 / this.fireSpeed);
  },

  fireBullet: function(angle) {
    var thePlayer = gbox.getObject('player', 'player_id');
    toys.topview.fireBullet('bullets', null, {
      tileset:      'player_shot',
      collidegroup: 'enemies',
      from:         thePlayer,
      x:            thePlayer.x + thePlayer.colhw - 2,
      y:            thePlayer.y + thePlayer.colhh - 2,
      accx:         8 * Math.cos(angle),
      accy:         8 * Math.sin(angle),
      maxacc:       8,
      frames:       { speed: 2, frames: [0, 1] },
      upper:        true,
      camera:       true,
      map:          the_game.map,
      mapindex:     'map'
    });
  }
});