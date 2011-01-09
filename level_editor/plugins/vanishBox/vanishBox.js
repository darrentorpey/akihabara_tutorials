introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:      'plugins/vanishBox/vanishBox.js',
  name:          'Vanishing Box', //For display on hover overs and in general...
  sprites:      [
    ['vanish_box_sprite', 'plugins/vanishBox/vanishBox.png']
  ],
  paletteImage:   'plugins/vanishBox/vanishBox.png',
  tiles: [
    {
      id:          'vanish_box_tile',
      image:        'vanish_box_sprite',
      tileh:        32,
      tilew:        32,
      tilerow:      1,
      gapx:        0,
      gapy:        0
    }
  ],
  group: "boxes",
  tileset: "vanish_box_tile",
  solidFloor: true,
  solidCeil: true,
  solidLeft: true,
  solidRight: true,
  add: function(data) {
    gbox.addObject({
      tileID:   data.tileID,
      group:   this.group,
      tileset:  this.tileset,
      initialize: function() {
        toys.platformer.initialize(this, {
          frames: {
            still:  { speed:1, frames:[0] },
            walking: { speed:1, frames:[0] },
            jumping: { speed:1, frames:[0] },
            falling: { speed:1, frames:[0] },
            die:    { speed:1, frames:[0] }
          },
          x: data.x,
          y: data.y,
          jumpaccy: 10,
          prevtouchedfloor: true,
          side: data.side
        });
        help.setTileInMap(gbox.getCanvasContext("map_canvas"), map, this.x / this.w, this.y / this.h, 6, "map");
      },

      first: function() {
        if (gbox.objectIsVisible(this) && gbox.getObject("player", "player_id")) {
          // Counter, required for setFrame
          this.counter = (this.counter + 1) % 10;
          for (var j in gbox._groups) {
            for (var i in gbox._objects[gbox._groups[j]]) {
              var group = gbox._groups[j];
              if (group == 'enemies' || group == 'player' || group == 'boxes') {
                var other = gbox._objects[group][i];
                if ((other.accy >= 0) && (other.y == this.y - other.h) && (other.x + other.w > this.x + 4) && (other.x < this.x + this.w - 4)) {
                  this.onMe = other;
                  if (toys.timer.every(this, 'fall', 30) == toys.TOY_DONE) {
                    help.setTileInMap(gbox.getCanvasContext('map_canvas'), map, this.x / this.w, this.y / this.h, null, "map");
                    gbox.trashObject(this);
                  }
                  if (this.toys['fall'].timer > 0) {
                    this.alpha = 1 - this.toys['fall'].timer / 30.0;
                  }
                } else if (this.toys && other == this.onMe) {
                  this.toys['fall'].timer = 0;
                  this.alpha = 1;
                }
              }
            }
          }
          toys.platformer.setFrame(this); // set the right animation frame
        }
      },

      blit: function() {
        // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
        //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
        //  spries is flipped, camera info, and the alpha transparency value
        if (gbox.objectIsVisible(this) && !this.blink || !(this.counter % 3)) {
          gbox.blitTile(gbox.getBufferContext(), {
            tileset: this.tileset,
            tile:  this.frame,
            dx:   this.x,
            dy:   this.y,
            fliph:  this.fliph,
            flipv:  this.flipv,
            camera:  this.camera,
            alpha:  this.alpha
          });
        }
      }
    });
  }
});