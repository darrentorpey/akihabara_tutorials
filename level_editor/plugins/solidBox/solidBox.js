introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:    'plugins/solidBox/solidBox.js',
  name:       'Solid Box', //For display on hover overs and in general...
  sprites:      [
    ['solid_block_sprite', 'plugins/solidBox/solidBox.png']
  ],
  paletteImage:   'plugins/solidBox/solidBoxPalette.png',
  tiles: [
    {
      id:   'solid_block_tile',  // Set a unique ID for future reference
      image:  'solid_block_sprite',
      tileh:  32,
      tilew:  32,
      tilerow: 2,
      gapx:  0,
      gapy:  0
    }
  ],
  group:"boxes",
  tileset:"solid_block_tile",
  solidFloor:    true,
  solidCeil:    true,
  solidLeft:    true,
  solidRight:    true,
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
            die:   { speed:1, frames:[0] }
          },
          x: data.x,
          y: data.y,
          jumpaccy: 10,
          prevtouchedfloor: true,
          side: data.side
        });
        this.killed = false;
      },

      first: function() {
        // Counter
        if (this.killed) {
          gbox.trashObject(this);
        }
        this.counter = (this.counter + 1) % 10;
		  var topleft = help.getTileInMap(this.x + 4, this.y - 1, map, 0, 'map');
		  var topright = help.getTileInMap(this.x + this.w - 4, this.y - 1, map, 0, 'map');
		  if ((topleft && topleft == parseInt(this.tileID)) || (topright && topright == parseInt(this.tileID))) {
		 	 //This is below an existing tile.
          this.frame = 0;
		  } else {
          this.frame = 1;
		  }

      },

      blit: function() {
        // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
        //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
        //  spries is flipped, camera info, and the alpha transparency value
        if (gbox.objectIsVisible(this)) {
          gbox.blitTile(gbox.getBufferContext(), {
            tileset: this.tileset,
            tile:  this.frame,
            dx:   this.x,
            dy:   this.y,
            fliph:  this.fliph,
            flipv:  this.flipv,
            camera:  this.camera,
            alpha:  1.0
          });
        }
      }
    });
  }
});